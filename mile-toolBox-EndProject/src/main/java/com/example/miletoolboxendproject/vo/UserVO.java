package com.example.miletoolboxendproject.vo;

import com.example.miletoolboxendproject.domain.ToolUser;
import lombok.Data;

import java.io.Serializable;

/**
 * 用户出参（不含密码）。
 */
@Data
public class UserVO implements Serializable {

    /** 用户ID */
    private Long id;

    /** 用户名 */
    private String username;

    /** 昵称 */
    private String nickname;

    /** 头像URL */
    private String avatar;

    /** 邮箱 */
    private String email;

    /** 手机号 */
    private String phone;

    /** 状态：0正常 1禁用（后台管理用） */
    private Integer status;

    /**
     * 由实体转换（剔除密码）
     *
     * @param user 用户实体
     */
    public static UserVO of(ToolUser user) {
        if (user == null) {
            return null;
        }
        UserVO vo = new UserVO();
        vo.setId(user.getId());
        vo.setUsername(user.getUsername());
        vo.setNickname(user.getNickname());
        vo.setAvatar(user.getAvatar());
        vo.setEmail(user.getEmail());
        vo.setPhone(user.getPhone());
        vo.setStatus(user.getStatus());
        return vo;
    }
}
