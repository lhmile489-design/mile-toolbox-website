package com.example.miletoolboxendproject.vo;

import lombok.Data;

import java.io.Serializable;

/**
 * IP 归属地查询结果。
 */
@Data
public class IpLocationVO implements Serializable {

    /** 查询的 IP */
    private String ip;

    /** 国家 */
    private String country;

    /** 省份 */
    private String province;

    /** 城市 */
    private String city;

    /** 运营商 ISP */
    private String isp;
}
