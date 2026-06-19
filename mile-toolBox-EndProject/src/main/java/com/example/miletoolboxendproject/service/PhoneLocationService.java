package com.example.miletoolboxendproject.service;

import com.example.miletoolboxendproject.vo.PhoneLocationVO;

/**
 * 手机号归属地查询服务（接口盒子 apihz.cn）。
 */
public interface PhoneLocationService {

    /**
     * 查询手机号归属地
     *
     * @param phone 11 位手机号
     * @return 归属地（省/市/运营商/区号/邮编）
     */
    PhoneLocationVO query(String phone);
}
