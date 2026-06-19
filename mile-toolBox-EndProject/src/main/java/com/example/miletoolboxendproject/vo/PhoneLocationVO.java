package com.example.miletoolboxendproject.vo;

import lombok.Data;

import java.io.Serializable;

/**
 * 手机号归属地查询结果。
 */
@Data
public class PhoneLocationVO implements Serializable {

    /** 查询的手机号 */
    private String phone;

    /** 手机号段（前 7 位） */
    private String segment;

    /** 归属省份 */
    private String province;

    /** 归属城市 */
    private String city;

    /** 运营商 */
    private String carrier;

    /** 区号 */
    private String areaCode;

    /** 邮编 */
    private String zipCode;
}
