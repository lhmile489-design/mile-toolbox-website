package com.example.miletoolboxendproject.domain;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;
import java.util.Date;

/**
 * 后台管理员实体。
 */
@Data
@TableName("admin_user")
public class AdminUser implements Serializable {

    /** 管理员ID */
    @TableId(type = IdType.AUTO)
    private Long id;

    /** 用户名（登录账号，唯一） */
    private String username;

    /** 密码（BCrypt 哈希，不对前端返回） */
    private String password;

    /** 昵称 */
    private String nickname;

    /** 状态：0正常 1禁用 */
    private Integer status;

    /** 创建时间 */
    private Date createTime;

    /** 更新时间 */
    private Date updateTime;
}
