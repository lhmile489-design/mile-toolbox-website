package com.example.miletoolboxendproject.service.impl;

import com.example.miletoolboxendproject.exception.BusinessException;
import com.example.miletoolboxendproject.exception.ErrCode;
import com.example.miletoolboxendproject.service.WeatherService;
import com.example.miletoolboxendproject.vo.WeatherVO;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

/**
 * 天气查询服务实现（uapis.cn）。
 * <p>调用 {@code https://uapis.cn/api/v1/misc/weather?city=&forecast=true&lang=zh}。
 * <p><b>关键</b>：成功响应直接返回数据对象（<b>无 code 字段</b>），
 * 错误响应才带字符串 {@code code}（如 INVALID_PARAMETER/NOT_FOUND）。
 * 据此判断成功/失败。
 */
@Slf4j
@Service
public class WeatherServiceImpl implements WeatherService {

    private static final String BASE_URL = "https://uapis.cn/api/v1/misc/weather";
    private static final ObjectMapper MAPPER = new ObjectMapper();

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    @Override
    public WeatherVO query(String city) {
        StringBuilder url = new StringBuilder(BASE_URL).append("?forecast=true&lang=zh");
        if (city != null && !city.isBlank()) {
            url.append("&city=").append(enc(city.trim()));
        }
        // city 为空时不传，由上游按 IP 自动定位
        String body = httpGet(url.toString());
        return parse(body);
    }

    /**
     * 解析 uapis 天气响应。
     * <p>成功对象无 code 字段；错误对象有 code（字符串）。
     */
    WeatherVO parse(String json) {
        try {
            JsonNode root = MAPPER.readTree(json);
            JsonNode codeNode = root.get("code");
            if (codeNode != null && !codeNode.isNull()) {
                // 错误响应：code 为字符串错误标识
                String msg = text(root, "message");
                String code = codeNode.asText();
                if ("NOT_FOUND".equalsIgnoreCase(code)) {
                    throw new BusinessException(ErrCode.LOCATION_NOT_FOUND,
                            msg == null ? "未找到该城市的天气数据" : msg);
                }
                if ("INVALID_PARAMETER".equalsIgnoreCase(code)) {
                    throw new BusinessException(ErrCode.PARAM_ERROR,
                            msg == null ? "参数无效" : msg);
                }
                throw new BusinessException(ErrCode.THIRD_PARTY_FAILED,
                        msg == null ? "天气服务返回错误" : msg);
            }
            WeatherVO vo = new WeatherVO();
            vo.setCity(text(root, "city"));
            vo.setTemp(text(root, "temperature"));
            vo.setWeather(text(root, "weather"));
            vo.setHumidity(text(root, "humidity"));
            vo.setWind(joinWind(text(root, "wind_direction"), text(root, "wind_power")));
            vo.setForecast(parseForecast(root.get("forecast")));
            return vo;
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            log.error("解析天气结果失败: {}", json, e);
            throw new BusinessException(ErrCode.THIRD_PARTY_FAILED, "解析天气结果失败");
        }
    }

    private List<WeatherVO.Forecast> parseForecast(JsonNode arr) {
        if (arr == null || !arr.isArray() || arr.isEmpty()) {
            return null;
        }
        List<WeatherVO.Forecast> list = new ArrayList<>();
        for (JsonNode day : arr) {
            WeatherVO.Forecast f = new WeatherVO.Forecast();
            f.setDate(text(day, "date"));
            f.setHigh(text(day, "temp_max"));
            f.setLow(text(day, "temp_min"));
            f.setWeather(text(day, "weather_day"));
            list.add(f);
        }
        return list;
    }

    private String joinWind(String direction, String power) {
        if (direction == null && power == null) {
            return null;
        }
        if (direction == null) {
            return power;
        }
        if (power == null) {
            return direction;
        }
        return direction + " " + power;
    }

    private String text(JsonNode node, String field) {
        JsonNode v = node.get(field);
        if (v == null || v.isNull()) {
            return null;
        }
        String s = v.asText().trim();
        return s.isEmpty() ? null : s;
    }

    private String enc(String s) {
        return URLEncoder.encode(s == null ? "" : s, StandardCharsets.UTF_8);
    }

    private String httpGet(String url) {
        try {
            HttpRequest req = HttpRequest.newBuilder(URI.create(url))
                    .timeout(Duration.ofSeconds(15)).GET().build();
            HttpResponse<String> resp = httpClient.send(req, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
            int sc = resp.statusCode();
            // 4xx 错误体也带 code/message，交由 parse 统一处理
            if (sc >= 500) {
                throw new BusinessException(ErrCode.THIRD_PARTY_FAILED, "天气服务返回 " + sc);
            }
            return resp.body();
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            log.error("天气服务调用失败", e);
            throw new BusinessException(ErrCode.THIRD_PARTY_FAILED, "天气服务调用失败");
        }
    }
}
