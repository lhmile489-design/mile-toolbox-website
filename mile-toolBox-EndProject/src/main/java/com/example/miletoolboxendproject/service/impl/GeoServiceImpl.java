package com.example.miletoolboxendproject.service.impl;

import com.example.miletoolboxendproject.config.ToolboxProperties;
import com.example.miletoolboxendproject.exception.BusinessException;
import com.example.miletoolboxendproject.exception.ErrCode;
import com.example.miletoolboxendproject.service.GeoService;
import com.example.miletoolboxendproject.vo.GeoForwardVO;
import com.example.miletoolboxendproject.vo.GeoReverseVO;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.Resource;
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
import java.util.UUID;

/**
 * 维智地图地理编码服务实现。
 * <p>HTTP 调用用 JDK {@link HttpClient}（java-dev：国内平台 API 优先用 HttpClient，规避 CDN 兼容问题）。
 * <p>解析逻辑（{@link #parseForward}/{@link #parseReverse}）独立，便于用真实响应样本做单元测试。
 */
@Slf4j
@Service
public class GeoServiceImpl implements GeoService {

    /** 正地理编码：GET /location/scenario/v1/geocode */
    private static final String FORWARD_PATH = "/location/scenario/v1/geocode";
    /** 逆地理编码复用轨迹点上报：POST /location/hub/v1/track_points */
    private static final String REVERSE_PATH = "/location/hub/v1/track_points";

    private static final ObjectMapper MAPPER = new ObjectMapper();

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    @Resource
    private ToolboxProperties toolboxProperties;

    @Override
    public List<GeoForwardVO> forward(String address, String city) {
        if (address == null || address.isBlank()) {
            throw new BusinessException(ErrCode.PARAM_ERROR, "地址不能为空");
        }
        String key = requireKey();
        String url = baseUrl() + FORWARD_PATH
                + "?access_key=" + enc(key)
                + "&address=" + enc(address)
                + "&city=" + enc(city == null ? "" : city);
        String body = httpGet(url);
        return parseForward(body);
    }

    @Override
    public GeoReverseVO reverse(double lng, double lat, String spatialReference) {
        String key = requireKey();
        String sr = (spatialReference == null || spatialReference.isBlank()) ? "gcj02" : spatialReference;
        long ts = System.currentTimeMillis();
        // 构造轨迹点请求体（与维智 SDK 一致）
        String reqBody;
        try {
            var point = MAPPER.createObjectNode();
            point.put("longitude", lng);
            point.put("latitude", lat);
            var position = MAPPER.createObjectNode();
            position.set("point", point);
            position.put("source", "");
            position.put("timestamp", ts);
            position.put("accuracy", 30);
            position.put("spatialReference", sr);
            var location = MAPPER.createObjectNode();
            location.put("timestamp", ts);
            location.set("position", position);
            var asset = MAPPER.createObjectNode();
            asset.put("id", "");
            var root = MAPPER.createObjectNode();
            root.set("asset", asset);
            root.set("location", location);
            root.put("id", UUID.randomUUID().toString());
            reqBody = MAPPER.writeValueAsString(root);
        } catch (Exception e) {
            throw new BusinessException(ErrCode.GEOCODE_FAILED, "构造请求失败");
        }
        String url = baseUrl() + REVERSE_PATH + "?access_key=" + enc(key);
        String body = httpPostJson(url, reqBody);
        return parseReverse(body);
    }

    // ===== 解析逻辑（可单测）=====

    /**
     * 解析正地理编码响应（POI 数组）
     */
    public List<GeoForwardVO> parseForward(String json) {
        try {
            JsonNode arr = MAPPER.readTree(json);
            List<GeoForwardVO> list = new ArrayList<>();
            if (!arr.isArray()) {
                return list;
            }
            for (JsonNode node : arr) {
                GeoForwardVO vo = new GeoForwardVO();
                vo.setName(text(node, "name"));
                String geoPoint = text(node, "geoPoint");   // "lng,lat"
                if (geoPoint != null && geoPoint.contains(",")) {
                    String[] p = geoPoint.split(",", 2);
                    vo.setLng(parseDouble(p[0]));
                    vo.setLat(parseDouble(p[1]));
                }
                JsonNode address = node.get("address");
                if (address != null) {
                    vo.setFormattedAddress(text(address, "name"));
                    vo.setProvince(contextName(address.get("context"), "province"));
                    vo.setCity(contextName(address.get("context"), "city"));
                    vo.setDistrict(contextName(address.get("context"), "district"));
                }
                list.add(vo);
            }
            return list;
        } catch (Exception e) {
            throw new BusinessException(ErrCode.GEOCODE_FAILED, "解析地理编码结果失败");
        }
    }

    /**
     * 解析逆地理编码响应
     */
    public GeoReverseVO parseReverse(String json) {
        try {
            JsonNode root = MAPPER.readTree(json);
            JsonNode location = root.get("location");
            if (location == null) {
                throw new BusinessException(ErrCode.LOCATION_NOT_FOUND, "未查询到地址");
            }
            GeoReverseVO vo = new GeoReverseVO();
            JsonNode address = location.get("address");
            if (address != null) {
                vo.setFormattedAddress(text(address, "name"));
                JsonNode ctx = address.get("context");
                vo.setProvince(contextName(ctx, "province"));
                vo.setCity(contextName(ctx, "city"));
                vo.setDistrict(contextName(ctx, "district"));
                vo.setTownship(contextName(ctx, "township"));
            }
            JsonNode place = location.get("place");
            if (place != null) {
                vo.setPlaceName(text(place, "name"));
            }
            JsonNode point = location.path("position").path("point");
            if (point.has("longitude")) {
                vo.setLng(point.get("longitude").asDouble());
                vo.setLat(point.get("latitude").asDouble());
            }
            if (vo.getFormattedAddress() == null || vo.getFormattedAddress().isBlank()) {
                throw new BusinessException(ErrCode.LOCATION_NOT_FOUND, "未查询到地址");
            }
            return vo;
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            throw new BusinessException(ErrCode.GEOCODE_FAILED, "解析逆地理编码结果失败");
        }
    }

    // ===== 内部工具 =====

    /** context 数组里按 type 取 name（不区分大小写，兼容正向小写/逆向首字母大写） */
    private String contextName(JsonNode context, String type) {
        if (context == null || !context.isArray()) {
            return null;
        }
        for (JsonNode item : context) {
            String t = text(item, "type");
            if (t != null && t.equalsIgnoreCase(type)) {
                return text(item, "name");
            }
        }
        return null;
    }

    private String text(JsonNode node, String field) {
        JsonNode v = node == null ? null : node.get(field);
        return v == null || v.isNull() ? null : v.asText();
    }

    private Double parseDouble(String s) {
        try {
            return Double.parseDouble(s.trim());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private String requireKey() {
        String key = toolboxProperties.getWayz().getAppKey();
        if (key == null || key.isBlank()) {
            throw new BusinessException(ErrCode.MAP_SDK_ERROR, "地图服务未配置 app-key");
        }
        return key;
    }

    private String baseUrl() {
        return toolboxProperties.getWayz().getBaseUrl();
    }

    private String enc(String s) {
        return URLEncoder.encode(s, StandardCharsets.UTF_8);
    }

    private String httpGet(String url) {
        try {
            HttpRequest req = HttpRequest.newBuilder(URI.create(url))
                    .timeout(Duration.ofSeconds(15)).GET().build();
            HttpResponse<String> resp = httpClient.send(req, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
            if (resp.statusCode() != 200) {
                throw new BusinessException(ErrCode.MAP_SDK_ERROR, "地图服务返回 " + resp.statusCode());
            }
            return resp.body();
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            log.error("维智正地理编码调用失败", e);
            throw new BusinessException(ErrCode.MAP_SDK_ERROR, "地图服务调用失败");
        }
    }

    private String httpPostJson(String url, String body) {
        try {
            HttpRequest req = HttpRequest.newBuilder(URI.create(url))
                    .timeout(Duration.ofSeconds(15))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(body, StandardCharsets.UTF_8))
                    .build();
            HttpResponse<String> resp = httpClient.send(req, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
            if (resp.statusCode() != 200) {
                throw new BusinessException(ErrCode.MAP_SDK_ERROR, "地图服务返回 " + resp.statusCode());
            }
            return resp.body();
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            log.error("维智逆地理编码调用失败", e);
            throw new BusinessException(ErrCode.MAP_SDK_ERROR, "地图服务调用失败");
        }
    }
}
