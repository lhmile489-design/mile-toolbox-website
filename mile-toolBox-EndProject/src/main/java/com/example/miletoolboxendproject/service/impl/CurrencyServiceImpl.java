package com.example.miletoolboxendproject.service.impl;

import com.example.miletoolboxendproject.config.ToolboxProperties;
import com.example.miletoolboxendproject.exception.BusinessException;
import com.example.miletoolboxendproject.exception.ErrCode;
import com.example.miletoolboxendproject.service.CurrencyService;
import com.example.miletoolboxendproject.vo.CurrencyVO;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.regex.Pattern;

/**
 * 货币汇率换算服务实现（接口盒子 apihz.cn）。
 * <p>调用 {@code /api/jinrong/huilv.php?id=&key=&from=&to=&money=}，
 * 成功返回 {@code {code:200, uptime, money, from, to, result, rate}}，
 * 失败返回 {@code {code:400, msg}}。
 * <p>HTTP 调用用 JDK {@link HttpClient}；解析逻辑独立便于单测。
 */
@Slf4j
@Service
public class CurrencyServiceImpl implements CurrencyService {

    private static final String PATH = "/api/jinrong/huilv.php";
    /** 货币代码：3 个字母（如 USD），大小写不限 */
    private static final Pattern CURRENCY = Pattern.compile("^[A-Za-z]{3}$");
    private static final ObjectMapper MAPPER = new ObjectMapper();

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    @Resource
    private ToolboxProperties toolboxProperties;

    @Override
    public CurrencyVO convert(String from, String to, BigDecimal amount) {
        if (from == null || !CURRENCY.matcher(from.trim()).matches()) {
            throw new BusinessException(ErrCode.PARAM_ERROR, "源货币代码格式错误（如 USD）");
        }
        if (to == null || !CURRENCY.matcher(to.trim()).matches()) {
            throw new BusinessException(ErrCode.PARAM_ERROR, "目标货币代码格式错误（如 CNY）");
        }
        if (amount == null || amount.signum() < 0) {
            throw new BusinessException(ErrCode.PARAM_ERROR, "换算金额必须为非负数");
        }
        String fromCode = from.trim().toUpperCase();
        String toCode = to.trim().toUpperCase();
        ToolboxProperties.Apihz cfg = toolboxProperties.getApihz();
        String url = cfg.getBaseUrl() + PATH
                + "?id=" + enc(cfg.getId())
                + "&key=" + enc(cfg.getKey())
                + "&from=" + enc(fromCode)
                + "&to=" + enc(toCode)
                + "&money=" + enc(amount.toPlainString());
        String body = httpGet(url);
        return parse(fromCode, toCode, amount, body);
    }

    /**
     * 解析 apihz huilv 响应。
     */
    CurrencyVO parse(String from, String to, BigDecimal amount, String json) {
        try {
            JsonNode root = MAPPER.readTree(json);
            int code = root.path("code").asInt(0);
            if (code != 200) {
                String msg = text(root, "msg");
                throw new BusinessException(ErrCode.THIRD_PARTY_FAILED,
                        msg == null ? "汇率服务返回错误" : msg);
            }
            JsonNode rateNode = root.get("rate");
            JsonNode resultNode = root.get("result");
            if (rateNode == null || rateNode.isNull()) {
                // 未带 from/to 时上游会返回货币大全（无 rate），属于参数误用
                throw new BusinessException(ErrCode.THIRD_PARTY_FAILED, "未返回汇率数据");
            }
            CurrencyVO vo = new CurrencyVO();
            vo.setFrom(from);
            vo.setTo(to);
            vo.setAmount(amount);
            vo.setRate(new BigDecimal(rateNode.asText().trim()));
            // result 缺省时本地按 rate*amount 兜底计算
            if (resultNode != null && !resultNode.isNull()) {
                vo.setResult(new BigDecimal(resultNode.asText().trim()));
            } else {
                vo.setResult(vo.getRate().multiply(amount));
            }
            vo.setUpdatedAt(text(root, "uptime"));
            return vo;
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            log.error("解析汇率结果失败: {}", json, e);
            throw new BusinessException(ErrCode.THIRD_PARTY_FAILED, "解析汇率结果失败");
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
                throw new BusinessException(ErrCode.THIRD_PARTY_FAILED, "汇率服务返回 " + resp.statusCode());
            }
            return resp.body();
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            log.error("汇率服务调用失败", e);
            throw new BusinessException(ErrCode.THIRD_PARTY_FAILED, "汇率服务调用失败");
        }
    }
}
