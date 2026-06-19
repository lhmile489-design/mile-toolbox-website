package com.example.miletoolboxendproject.utils;

import cn.dev33.satoken.stp.StpUtil;

/**
 * 鉴权辅助工具。
 */
public class AuthUtils {

    private AuthUtils() {
    }

    /**
     * 获取当前登录用户ID；未登录返回 null（用于公开接口的可选个性化，如标记收藏）。
     */
    public static Long currentUserIdOrNull() {
        try {
            if (StpUtil.isLogin()) {
                return StpUtil.getLoginIdAsLong();
            }
        } catch (Exception ignored) {
            // 公开接口无登录态时静默降级为匿名
        }
        return null;
    }
}
