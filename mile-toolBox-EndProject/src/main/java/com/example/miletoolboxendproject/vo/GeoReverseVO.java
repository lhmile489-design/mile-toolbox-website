package com.example.miletoolboxendproject.vo;

import lombok.Data;

import java.io.Serializable;

/**
 * 逆地理编码结果（坐标 → 地址）。坐标系 gcj02。
 */
@Data
public class GeoReverseVO implements Serializable {

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

    /** 乡镇/街道 */
    private String township;

    /** 最近 POI 名称 */
    private String placeName;
}
