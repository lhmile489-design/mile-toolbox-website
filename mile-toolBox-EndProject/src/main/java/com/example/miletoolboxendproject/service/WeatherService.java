package com.example.miletoolboxendproject.service;

import com.example.miletoolboxendproject.vo.WeatherVO;

/**
 * 天气查询服务（uapis.cn）。
 */
public interface WeatherService {

    /**
     * 按城市名查询天气（含多天预报）
     *
     * @param city 城市名（中/英文）；为空时按客户端 IP 自动定位
     * @return 实时天气 + 预报
     */
    WeatherVO query(String city);
}
