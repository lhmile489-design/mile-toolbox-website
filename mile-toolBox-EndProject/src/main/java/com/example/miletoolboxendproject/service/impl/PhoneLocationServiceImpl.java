package com.example.miletoolboxendproject.service.impl;

import com.example.miletoolboxendproject.config.ToolboxProperties;
import com.example.miletoolboxendproject.exception.BusinessException;
import com.example.miletoolboxendproject.exception.ErrCode;
import com.example.miletoolboxendproject.service.PhoneLocationService;
import com.example.miletoolboxendproject.vo.PhoneLocationVO;
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
import java.util.regex.Pattern;

/**
 * 手机号归属地查询服务实现（接口盒子 apihz.cn）。
 * <p>调用 {@code /api/ip/shouji.php?id=&key=&phone=}，返回 JSON：
 * {@code code/haoduan/shengfen/chengshi/fuwushang/quhao/youbian/qhdm}。
 * <p>HTTP 调用用 JDK {@link HttpClient}；解析逻辑独立便于单测。
 */
@Slf4j
@Service
public class PhoneLocationServiceImpl implements PhoneLocationService {

    private static final String PATH = "/api/ip/shouji.php";
    private static final Pattern PHONE = Pattern.compile("^1[3-9]\\d{9}$");
    private static final ObjectMapper MAPPER = new ObjectMapper();

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    @Resource
    private ToolboxProperties toolboxProperties;

    @Override
    public PhoneLocationVO query(String phone) {
        if (phone == null || !PHONE.matcher(phone.trim()).matches()) {
            throw new BusinessException(ErrCode.PHONE_FORMAT_ERROR);
        }
        ToolboxProperties.Apihz cfg = toolboxProperties.getApihz();
        String url = cfg.getBaseUrl() + PATH
                + "?id=" + enc(cfg.getId())
                + "&key=" + enc(cfg.getKey())
                + "&phone=" + enc(phone.trim());
        String body = httpGet(url);
        return parse(phone.trim(), body);
    }

    /**
     * 解析 apihz 响应。
     */
    PhoneLocationVO parse(String phone, String json) {
        try {
            JsonNode root = MAPPER.readTree(json);
            int code = root.path("code").asInt(0);
            if (code != 200) {
                String msg = text(root, "msg");
                // 上游返回的错误（如号段未收录），归类为未查询到
                throw new BusinessException(ErrCode.LOCATION_NOT_FOUND,
                        msg == null ? "未查询到归属地信息" : msg);
            }
            PhoneLocationVO vo = new PhoneLocationVO();
            vo.setPhone(phone);
            vo.setSegment(text(root, "haoduan"));
            vo.setProvince(text(root, "shengfen"));
            vo.setCity(text(root, "chengshi"));
            vo.setCarrier(text(root, "fuwushang"));
            vo.setAreaCode(text(root, "quhao"));
            vo.setZipCode(text(root, "youbian"));
            return vo;
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            throw new BusinessException(ErrCode.LOCATION_NOT_FOUND, "解析归属地结果失败");
        }
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
            if (resp.statusCode() != 200) {
                throw new BusinessException(ErrCode.LOCATION_NOT_FOUND, "归属地服务返回 " + resp.statusCode());
            }
            return resp.body();
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            log.error("手机号归属地调用失败", e);
            throw new BusinessException(ErrCode.LOCATION_NOT_FOUND, "归属地服务调用失败");
        }
    }
}
