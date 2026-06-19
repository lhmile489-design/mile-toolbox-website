package com.example.miletoolboxendproject;

import com.example.miletoolboxendproject.exception.BusinessException;
import com.example.miletoolboxendproject.service.impl.PhoneLocationServiceImpl;
import com.example.miletoolboxendproject.vo.PhoneLocationVO;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

/**
 * PhoneLocationServiceImpl 单测：
 * - parse 解析 apihz 真实响应样本；
 * - 非法手机号抛 10400；
 * - 上游 code!=200 归类为未查询到（10402）。
 * JSON 样本取自对 apihz 接口的真实调用响应。
 */
class PhoneLocationServiceImplTest {

    private final PhoneLocationServiceImpl service = new PhoneLocationServiceImpl();

    /** 真实响应样本（来自 cn.apihz.cn/api/ip/shouji.php） */
    private static final String OK_JSON =
            "{\"code\":200,\"haoduan\":\"1321993\",\"shengfen\":\"四川\",\"chengshi\":\"绵阳\","
                    + "\"fuwushang\":\"中国联通\",\"quhao\":\"0816\",\"qhdm\":\"510700\",\"youbian\":\"621000\"}";

    private PhoneLocationVO parse(String phone, String json) {
        return (PhoneLocationVO) ReflectionTestUtils.invokeMethod(service, "parse", phone, json);
    }

    @Test
    void parse_mapsFields() {
        PhoneLocationVO vo = parse("13219931963", OK_JSON);
        assertEquals("13219931963", vo.getPhone());
        assertEquals("1321993", vo.getSegment());
        assertEquals("四川", vo.getProvince());
        assertEquals("绵阳", vo.getCity());
        assertEquals("中国联通", vo.getCarrier());
        assertEquals("0816", vo.getAreaCode());
        assertEquals("621000", vo.getZipCode());
    }

    @Test
    void parse_upstreamError_throwsNotFound() {
        BusinessException e = assertThrows(BusinessException.class,
                () -> parse("13800000000", "{\"code\":400,\"msg\":\"手机号格式错误\"}"));
        assertEquals("10402", e.getCode());
    }

    @Test
    void query_invalidPhone_throws() {
        BusinessException e = assertThrows(BusinessException.class, () -> service.query("123"));
        assertEquals("10400", e.getCode());
    }
}
