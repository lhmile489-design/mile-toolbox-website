package com.example.miletoolboxendproject.satoken;

import cn.dev33.satoken.stp.StpLogic;

/**
 * Sa-Token 后台管理域（ADMIN）账号体系。
 * <p>前台用户用默认的 {@code StpUtil}（登录类型 "login"），后台管理用本类（登录类型 "ADMIN"），
 * 两套登录态互不干扰。注解鉴权用 {@code @SaCheckLogin(type = "ADMIN")} 命中本域。
 * <p>创建 StpLogic 实例会自动注册到 SaManager，供注解按 type 查找。
 */
public class StpAdminUtil {

    /** 账号体系标识 */
    public static final String TYPE = "ADMIN";

    /** 底层 StpLogic（构造即注册到 SaManager） */
    public static final StpLogic stpLogic = new StpLogic(TYPE);

    /**
     * 登录
     *
     * @param loginId 管理员ID
     */
    public static void login(Object loginId) {
        stpLogic.login(loginId);
    }

    /**
     * 当前是否已登录
     */
    public static boolean isLogin() {
        return stpLogic.isLogin();
    }

    /**
     * 校验登录态（未登录抛 NotLoginException）
     */
    public static void checkLogin() {
        stpLogic.checkLogin();
    }

    /**
     * 获取当前登录管理员ID
     */
    public static Object getLoginId() {
        return stpLogic.getLoginId();
    }

    /**
     * 获取当前登录管理员ID（long）
     */
    public static long getLoginIdAsLong() {
        return stpLogic.getLoginIdAsLong();
    }

    /**
     * 登出
     */
    public static void logout() {
        stpLogic.logout();
    }
}
