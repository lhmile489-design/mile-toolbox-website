package com.example.miletoolboxendproject;

import com.example.miletoolboxendproject.exception.BusinessException;
import com.example.miletoolboxendproject.service.impl.ZipcodeServiceImpl;
import com.example.miletoolboxendproject.vo.ZipcodeVO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * ZipcodeServiceImpl 真实验证：加载 classpath 下真实邮编数据集，按地区名/邮编查询。
 */
class ZipcodeServiceImplTest {

    private ZipcodeServiceImpl service;

    @BeforeEach
    void setUp() {
        service = new ZipcodeServiceImpl();
        service.init();   // 真实加载 china-zipcode.json
    }

    @Test
    void query_byDistrictName() {
        List<ZipcodeVO> r = service.query("朝阳区");
        assertFalse(r.isEmpty());
        // 北京朝阳区邮编 100020 应在结果中
        boolean hit = r.stream().anyMatch(z ->
                "100020".equals(z.getZipcode()) && "北京".equals(z.getProvince()));
        assertTrue(hit, "应含北京朝阳区 100020");
    }

    @Test
    void query_byZipcodePrefix() {
        List<ZipcodeVO> r = service.query("1000");
        assertFalse(r.isEmpty());
        assertTrue(r.stream().allMatch(z -> z.getZipcode().startsWith("1000")), "结果邮编应以 1000 开头");
    }

    @Test
    void query_blank_throws() {
        BusinessException e = assertThrows(BusinessException.class, () -> service.query("  "));
        assertEquals("10001", e.getCode());
    }

    @Test
    void query_noMatch_throws() {
        BusinessException e = assertThrows(BusinessException.class, () -> service.query("不存在的地名XYZ"));
        assertEquals("10402", e.getCode());
    }
}
