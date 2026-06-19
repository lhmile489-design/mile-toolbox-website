package com.example.miletoolboxendproject;

import com.example.miletoolboxendproject.exception.BusinessException;
import com.example.miletoolboxendproject.service.impl.IpLocationServiceImpl;
import com.example.miletoolboxendproject.vo.IpLocationVO;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

/**
 * IpLocationServiceImpl 单测：
 * - parse 解析「国家|区域|省份|城市|ISP」，占位 0/空 归一化为 null（经 ReflectionTestUtils 调用包级方法）；
 * - 非法 IP 抛 10401；
 * - 真实 xdb 加载并查询已知 IP（114.114.114.114）。
 */
class IpLocationServiceImplTest {

    private IpLocationServiceImpl service;

    @BeforeEach
    void setUp() {
        service = new IpLocationServiceImpl();
    }

    @AfterEach
    void tearDown() {
        service.destroy();
    }

    private IpLocationVO parse(String ip, String region) {
        return (IpLocationVO) ReflectionTestUtils.invokeMethod(service, "parse", ip, region);
    }

    @Test
    void parse_mapsFields() {
        IpLocationVO vo = parse("1.2.3.4", "中国|0|北京|北京市|联通");
        assertEquals("中国", vo.getCountry());
        assertEquals("北京", vo.getProvince());
        assertEquals("北京市", vo.getCity());
        assertEquals("联通", vo.getIsp());
    }

    @Test
    void parse_zeroFieldsBecomeNull() {
        IpLocationVO vo = parse("1.2.3.4", "0|0|0|0|0");
        assertNull(vo.getCountry());
        assertNull(vo.getProvince());
        assertNull(vo.getCity());
        assertNull(vo.getIsp());
    }

    @Test
    void query_invalidIp_throws() {
        BusinessException e = assertThrows(BusinessException.class, () -> service.query("999.1.1.1"));
        assertEquals("10401", e.getCode());
    }

    @Test
    void query_realXdb_knownIp() {
        service.init();   // 真实加载 classpath 下的 ip2region.xdb
        IpLocationVO vo = service.query("114.114.114.114");
        assertNotNull(vo);
        assertEquals("中国", vo.getCountry());
        assertNotNull(vo.getProvince());   // 具体省份随库版本，断言非空即可
    }
}
