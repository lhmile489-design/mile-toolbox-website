package com.example.miletoolboxendproject.domain;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;
import java.util.Date;

/**
 * 前台用户实体。
 */
@Data
@TableName("tool_user")
public class ToolUser implements Serializable {

    /** 用户ID */
    @TableId(type = IdType.AUTO)
    private Long id;

    /** 用户名（登录账号，唯一） */
    private String username;

    /** 密码（BCrypt 哈希，不对前端返回） */
    private String password;

    /** 昵称 */
    private String nickname;

    /** 头像URL */
    private String avatar;

    /** 邮箱 */
    private String email;

    /** 手机号 */
    private String phone;

    /** 状态：0正常 1禁用 */
    private Integer status;

    /** 注册时间 */
    private Date createTime;

    /** 更新时间 */
    private Date updateTime;
}
