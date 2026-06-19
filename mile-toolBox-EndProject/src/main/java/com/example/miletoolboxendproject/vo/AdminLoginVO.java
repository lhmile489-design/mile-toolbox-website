package com.example.miletoolboxendproject.vo;

import lombok.Data;

import java.io.Serializable;

/**
 * 管理员登录响应。
 */
@Data
public class AdminLoginVO implements Serializable {

    /** 登录令牌 */
    private String token;

    /** 管理员信息 */
    private AdminVO admin;

    public AdminLoginVO(String token, AdminVO admin) {
        this.token = token;
        this.admin = admin;
    }
}
