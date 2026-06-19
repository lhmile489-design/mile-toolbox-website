package com.example.miletoolboxendproject;

import com.example.miletoolboxendproject.service.impl.GeoServiceImpl;
import com.example.miletoolboxendproject.vo.GeoForwardVO;
import com.example.miletoolboxendproject.vo.GeoReverseVO;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * 维智地理编码解析单测。
 * JSON 样本取自对维智接口的真实调用响应（已脱去多余项），验证解析映射正确。
 */
class GeoServiceImplTest {

    private final GeoServiceImpl service = new GeoServiceImpl();

    /** 正地理编码真实响应样本（数组，保留 1 项） */
    private static final String FORWARD_JSON = """
            [{"id":"0dfc16d6","geoPoint":"116.477795,39.997063","type":"Entity",
              "name":"合生·麒麟新天地写字楼",
              "address":{"name":"北京市朝阳区望京街道朝阳望京北京市朝阳区望京街2号",
                "context":[{"type":"province","name":"北京市","code":"110000"},
                           {"type":"city","name":"北京市","code":"110100"},
                           {"type":"district","name":"朝阳区","code":"110105"},
                           {"type":"township","name":"望京街道","code":"110105026"}]}}]
            """;

    /** 逆地理编码真实响应样本 */
    private static final String REVERSE_JSON = """
            {"id":"7f093493","asset":"","location":{"timestamp":1781714460202,
              "address":{"name":"北京市朝阳区望京街道朝阳望京北京市朝阳区望京街2号",
                "context":[{"type":"Country","name":"中国","code":"CN"},
                           {"type":"Province","name":"北京市","code":"110000"},
                           {"type":"City","name":"北京市","code":"110100"},
                           {"type":"District","name":"朝阳区","code":"110105"},
                           {"type":"Township","name":"望京街道","code":"110105026"}]},
              "place":{"type":"Entity","name":"合生·麒麟新天地写字楼","distance":{"line":0.1408}},
              "position":{"timestamp":1781714460202,"point":{"longitude":116.477795,"latitude":39.997063},
                "spatialReference":"gcj02","accuracy":30}}}
            """;

    @Test
    void parseForward_mapsFirstCandidate() {
        List<GeoForwardVO> list = service.parseForward(FORWARD_JSON);
        assertEquals(1, list.size());
        GeoForwardVO vo = list.get(0);
        assertEquals(116.477795, vo.getLng(), 1e-6);
        assertEquals(39.997063, vo.getLat(), 1e-6);
        assertEquals("北京市", vo.getProvince());
        assertEquals("北京市", vo.getCity());
        assertEquals("朝阳区", vo.getDistrict());
        assertTrue(vo.getName().contains("合生"));
        assertFalse(vo.getFormattedAddress().isBlank());
    }

    @Test
    void parseReverse_mapsStructuredAddress() {
        GeoReverseVO vo = service.parseReverse(REVERSE_JSON);
        assertEquals("北京市", vo.getProvince());
        assertEquals("北京市", vo.getCity());
        assertEquals("朝阳区", vo.getDistrict());
        assertEquals("望京街道", vo.getTownship());
        assertTrue(vo.getPlaceName().contains("合生"));
        assertEquals(116.477795, vo.getLng(), 1e-6);
        assertTrue(vo.getFormattedAddress().contains("望京"));
    }
}
