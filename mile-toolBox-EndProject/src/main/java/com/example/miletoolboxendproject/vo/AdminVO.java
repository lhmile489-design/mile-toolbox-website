package com.example.miletoolboxendproject.vo;

import com.example.miletoolboxendproject.domain.AdminUser;
import lombok.Data;

import java.io.Serializable;

/**
 * 管理员出参（不含密码）。
 */
@Data
public class AdminVO implements Serializable {

    /** 管理员ID */
    private Long id;

    /** 用户名 */
    private String username;

    /** 昵称 */
    private String nickname;

    /**
     * 由实体转换（剔除密码）
     */
    public static AdminVO of(AdminUser admin) {
        if (admin == null) {
            return null;
        }
        AdminVO vo = new AdminVO();
        vo.setId(admin.getId());
        vo.setUsername(admin.getUsername());
        vo.setNickname(admin.getNickname());
        return vo;
    }
}
