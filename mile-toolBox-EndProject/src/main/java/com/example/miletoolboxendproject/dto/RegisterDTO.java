package com.example.miletoolboxendproject.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * 用户注册入参。
 */
@Data
public class RegisterDTO {

    /** 用户名 */
    @NotBlank(message = "用户名不能为空")
    @Size(min = 3, max = 32, message = "用户名长度需在3-32之间")
    private String username;

    /** 密码 */
    @NotBlank(message = "密码不能为空")
    @Size(min = 6, max = 32, message = "密码长度需在6-32之间")
    private String password;

    /** 昵称（可选） */
    private String nickname;
}
