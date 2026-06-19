package com.example.miletoolboxendproject.vo;

import lombok.Data;

import java.io.Serializable;
import java.util.List;

/**
 * 天气查询结果。
 * <p>对接 uapis.cn {@code /api/v1/misc/weather}（带 forecast=true 拿多天预报）。
 */
@Data
public class WeatherVO implements Serializable {

    /** 城市名 */
    private String city;

    /** 当前温度 °C */
    private String temp;

    /** 天气现象文本（如：晴、多云） */
    private String weather;

    /** 相对湿度 %（原样字符串，可能带或不带 %） */
    private String humidity;

    /** 风力/风向描述（拼接 wind_direction + wind_power） */
    private String wind;

    /** 多天预报（forecast=true 时返回，最多 7 天） */
    private List<Forecast> forecast;

    /**
     * 单日预报。
     */
    @Data
    public static class Forecast implements Serializable {
        /** 日期 YYYY-MM-DD */
        private String date;

        /** 最高温度 °C */
        private String high;

        /** 最低温度 °C */
        private String low;

        /** 当日天气（取白天天气 weather_day） */
        private String weather;
    }
}
