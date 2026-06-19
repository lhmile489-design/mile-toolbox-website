package com.example.miletoolboxendproject.vo;

import lombok.Data;

import java.io.Serializable;

/**
 * 登录响应。
 */
@Data
public class LoginVO implements Serializable {

    /** 登录令牌 */
    private String token;

    /** 用户信息 */
    private UserVO user;

    public LoginVO(String token, UserVO user) {
        this.token = token;
        this.user = user;
    }
}
