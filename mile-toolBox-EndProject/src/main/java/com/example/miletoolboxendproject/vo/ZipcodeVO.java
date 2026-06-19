package com.example.miletoolboxendproject.vo;

import lombok.Data;

import java.io.Serializable;

/**
 * 邮编查询结果项。
 */
@Data
public class ZipcodeVO implements Serializable {

    /** 邮政编码 */
    private String zipcode;

    /** 省 */
    private String province;

    /** 市 */
    private String city;

    /** 区/县 */
    private String district;

    public ZipcodeVO(String zipcode, String province, String city, String district) {
        this.zipcode = zipcode;
        this.province = province;
        this.city = city;
        this.district = district;
    }
}
