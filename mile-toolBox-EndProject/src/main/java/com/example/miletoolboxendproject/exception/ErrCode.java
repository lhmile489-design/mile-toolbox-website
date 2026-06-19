package com.example.miletoolboxendproject.exception;

import lombok.Getter;

/**
 * 错误码枚举。
 * <p>分段规范见 docs/错误码与响应规范.md。
 * <p><b>关键红线</b>：鉴权失效码（{@link #NOT_LOGIN} 10005）与系统错误码（{@link #SYSTEM_ERROR} 10010）
 * 必须分开，前端只在鉴权码上登出。
 */
@Getter
public enum ErrCode {

    // ===== 通用 / 鉴权（10001~10099）=====
    PARAM_ERROR("10001", "参数错误"),
    DATA_NOT_FOUND("10002", "数据不存在"),
    NOT_LOGIN("10005", "未登录或登录已失效"),
    NO_PERMISSION("10007", "无权限操作"),
    SYSTEM_ERROR("10010", "系统繁忙，请稍后再试"),

    // ===== 用户模块（10100~10199）=====
    USERNAME_EXISTS("10100", "用户名已存在"),
    USER_NOT_FOUND("10101", "用户不存在"),
    PASSWORD_ERROR("10102", "用户名或密码错误"),
    USER_DISABLED("10103", "账号已被禁用"),
    OLD_PASSWORD_ERROR("10104", "原密码错误"),

    // ===== 工具 / 收藏 / 使用（10200~10299）=====
    TOOL_NOT_FOUND("10200", "工具不存在"),
    TOOL_OFFLINE("10201", "工具已下架"),
    FAVORITE_EXISTS("10202", "已收藏该工具"),
    FAVORITE_NOT_FOUND("10203", "未收藏该工具"),

    // ===== 文件处理（10300~10399）=====
    FILE_EMPTY("10300", "文件不能为空"),
    FILE_TYPE_NOT_SUPPORT("10301", "不支持的文件类型"),
    FILE_TOO_LARGE("10302", "文件超过大小限制"),
    FILE_COUNT_EXCEED("10303", "文件数量超过限制"),
    FILE_PROCESS_FAILED("10304", "文件处理失败"),
    TASK_NOT_FOUND("10305", "任务不存在"),
    RATE_LIMIT("10306", "操作过于频繁，请稍后再试"),

    // ===== 查询工具（10400~10499）=====
    PHONE_FORMAT_ERROR("10400", "手机号格式错误"),
    IP_FORMAT_ERROR("10401", "IP地址格式错误"),
    LOCATION_NOT_FOUND("10402", "未查询到归属地信息"),
    GEOCODE_FAILED("10403", "地理编码失败"),
    MAP_SDK_ERROR("10404", "地图服务调用失败"),
    THIRD_PARTY_FAILED("10405", "第三方服务调用失败");

    /** 错误码 */
    private final String code;

    /** 默认提示信息 */
    private final String msg;

    ErrCode(String code, String msg) {
        this.code = code;
        this.msg = msg;
    }
}
