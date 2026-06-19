package com.example.miletoolboxendproject.dto;

import lombok.Data;

/**
 * 修改个人资料入参（仅更新非空字段）。
 */
@Data
public class UpdateProfileDTO {

    /** 昵称 */
    private String nickname;

    /** 头像URL */
    private String avatar;

    /** 邮箱 */
    private String email;

    /** 手机号 */
    private String phone;
}
