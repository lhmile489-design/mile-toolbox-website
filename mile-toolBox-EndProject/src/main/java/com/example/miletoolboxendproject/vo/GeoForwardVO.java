package com.example.miletoolboxendproject.vo;

import lombok.Data;

import java.io.Serializable;

/**
 * 正地理编码结果项（地址 → 坐标候选）。坐标系 gcj02。
 */
@Data
public class GeoForwardVO implements Serializable {

    /** POI 名称 */
    private String name;

    /** 经度 */
    private Double lng;

    /** 纬度 */
    private Double lat;

    /** 完整地址 */
    private String formattedAddress;

    /** 省 */
    private String province;

    /** 市 */
    private String city;

    /** 区/县 */
    private String district;
}
