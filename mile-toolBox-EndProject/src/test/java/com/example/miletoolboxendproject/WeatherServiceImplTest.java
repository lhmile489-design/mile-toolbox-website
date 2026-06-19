package com.example.miletoolboxendproject;

import com.example.miletoolboxendproject.exception.BusinessException;
import com.example.miletoolboxendproject.service.impl.WeatherServiceImpl;
import com.example.miletoolboxendproject.vo.WeatherVO;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

/**
 * WeatherServiceImpl 单测：
 * - parse 解析 uapis.cn 真实响应样本（来自接口文档）；
 * - 成功响应无 code 字段 → 解析数据；
 * - 错误响应带字符串 code → NOT_FOUND 抛 10402、INVALID_PARAMETER 抛 10001、其他抛 10405。
 * JSON 样本取自 uapis.cn 官方文档示例。
 */
class WeatherServiceImplTest {

    private final WeatherServiceImpl service = new WeatherServiceImpl();

    /** 真实成功样本（uapis.cn 文档，含 forecast 一天） */
    private static final String OK_JSON =
            "{\"province\":\"北京市\",\"city\":\"北京\",\"district\":\"海淀区\",\"adcode\":\"\","
                    + "\"weather\":\"晴\",\"weather_icon\":\"100\",\"temperature\":18.3,"
                    + "\"wind_direction\":\"西南风\",\"wind_power\":\"微风\",\"humidity\":20,"
                    + "\"report_time\":\"2026-02-19 15:25:58\",\"temp_max\":14,\"temp_min\":-1,"
                    + "\"forecast\":[{\"date\":\"2026-02-19\",\"week\":\"星期四\",\"temp_max\":14,"
                    + "\"temp_min\":-1,\"weather_day\":\"晴\",\"weather_night\":\"晴\"}]}";

    private WeatherVO parse(String json) {
        return (WeatherVO) ReflectionTestUtils.invokeMethod(service, "parse", json);
    }

    @Test
    void parse_mapsFields() {
        WeatherVO vo = parse(OK_JSON);
        assertEquals("北京", vo.getCity());
        assertEquals("18.3", vo.getTemp());
        assertEquals("晴", vo.getWeather());
        assertEquals("20", vo.getHumidity());
        assertEquals("西南风 微风", vo.getWind());
        assertNotNull(vo.getForecast());
        assertEquals(1, vo.getForecast().size());
        WeatherVO.Forecast f = vo.getForecast().get(0);
        assertEquals("2026-02-19", f.getDate());
        assertEquals("14", f.getHigh());
        assertEquals("-1", f.getLow());
        assertEquals("晴", f.getWeather());
    }

    @Test
    void parse_notFound_throwsLocationNotFound() {
        BusinessException e = assertThrows(BusinessException.class,
                () -> parse("{\"code\":\"NOT_FOUND\",\"message\":\"未找到该城市的天气数据\"}"));
        assertEquals("10402", e.getCode());
    }

    @Test
    void parse_invalidParameter_throwsParam() {
        BusinessException e = assertThrows(BusinessException.class,
                () -> parse("{\"code\":\"INVALID_PARAMETER\",\"message\":\"参数无效\"}"));
        assertEquals("10001", e.getCode());
    }

    @Test
    void parse_serverError_throwsThirdParty() {
        BusinessException e = assertThrows(BusinessException.class,
                () -> parse("{\"code\":\"INTERNAL_SERVER_ERROR\",\"message\":\"服务器内部错误\"}"));
        assertEquals("10405", e.getCode());
    }
}
