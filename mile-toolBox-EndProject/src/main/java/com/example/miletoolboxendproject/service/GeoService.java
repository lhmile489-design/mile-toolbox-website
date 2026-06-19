package com.example.miletoolboxendproject.service;

import com.example.miletoolboxendproject.vo.GeoForwardVO;
import com.example.miletoolboxendproject.vo.GeoReverseVO;

import java.util.List;

/**
 * 地理编码服务（维智地图）。
 */
public interface GeoService {

    /**
     * 正地理编码：地址 → 坐标候选列表
     *
     * @param address 地址/关键词
     * @param city    城市（可空）
     */
    List<GeoForwardVO> forward(String address, String city);

    /**
     * 逆地理编码：坐标 → 地址
     *
     * @param lng              经度
     * @param lat              纬度
     * @param spatialReference 坐标系（默认 gcj02）
     */
    GeoReverseVO reverse(double lng, double lat, String spatialReference);
}
