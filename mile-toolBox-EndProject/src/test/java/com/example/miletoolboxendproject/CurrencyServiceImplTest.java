package com.example.miletoolboxendproject;

import com.example.miletoolboxendproject.exception.BusinessException;
import com.example.miletoolboxendproject.service.impl.CurrencyServiceImpl;
import com.example.miletoolboxendproject.vo.CurrencyVO;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

/**
 * CurrencyServiceImpl 单测：
 * - parse 解析 apihz huilv 真实响应样本（来自接口文档）；
 * - 非法货币代码/金额抛 10001；
 * - 上游 code!=200 抛 10405。
 * JSON 样本取自接口盒子官方文档示例。
 */
class CurrencyServiceImplTest {

    private final CurrencyServiceImpl service = new CurrencyServiceImpl();

    /** 真实响应样本（接口盒子文档示例） */
    private static final String OK_JSON =
            "{\"code\":200,\"uptime\":\"2025-12-20 08:00:01\",\"money\":\"1\","
                    + "\"from\":\"USD\",\"to\":\"CNY\",\"result\":7.0511,\"rate\":7.0511}";

    private CurrencyVO parse(String from, String to, BigDecimal amount, String json) {
        return (CurrencyVO) ReflectionTestUtils.invokeMethod(service, "parse", from, to, amount, json);
    }

    @Test
    void parse_mapsFields() {
        CurrencyVO vo = parse("USD", "CNY", new BigDecimal("10"), OK_JSON);
        assertEquals("USD", vo.getFrom());
        assertEquals("CNY", vo.getTo());
        assertEquals(new BigDecimal("10"), vo.getAmount());
        assertEquals(new BigDecimal("7.0511"), vo.getRate());
        assertEquals(new BigDecimal("7.0511"), vo.getResult());
        assertEquals("2025-12-20 08:00:01", vo.getUpdatedAt());
    }

    @Test
    void parse_resultMissing_computesLocally() {
        String json = "{\"code\":200,\"uptime\":\"2025-12-20 08:00:01\","
                + "\"from\":\"USD\",\"to\":\"CNY\",\"rate\":7}";
        CurrencyVO vo = parse("USD", "CNY", new BigDecimal("3"), json);
        assertEquals(new BigDecimal("21"), vo.getResult());
    }

    @Test
    void parse_upstreamError_throwsThirdParty() {
        BusinessException e = assertThrows(BusinessException.class,
                () -> parse("USD", "CNY", BigDecimal.ONE, "{\"code\":400,\"msg\":\"通讯秘钥错误。\"}"));
        assertEquals("10405", e.getCode());
    }

    @Test
    void convert_invalidCurrency_throwsParam() {
        BusinessException e = assertThrows(BusinessException.class,
                () -> service.convert("US", "CNY", BigDecimal.ONE));
        assertEquals("10001", e.getCode());
    }

    @Test
    void convert_negativeAmount_throwsParam() {
        BusinessException e = assertThrows(BusinessException.class,
                () -> service.convert("USD", "CNY", new BigDecimal("-1")));
        assertEquals("10001", e.getCode());
    }
}
