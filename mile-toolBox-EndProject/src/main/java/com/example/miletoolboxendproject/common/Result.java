package com.example.miletoolboxendproject.common;

import com.example.miletoolboxendproject.exception.ErrCode;
import lombok.Data;

import java.io.Serializable;

/**
 * 统一响应体。
 * <p>成功固定 code="200"；失败为业务错误码（见 {@link ErrCode} 与 docs/错误码与响应规范.md）。
 *
 * @param <T> 业务数据类型
 */
@Data
public class Result<T> implements Serializable {

    /** 成功状态码 */
    public static final String SUCCESS_CODE = "200";

    /** 状态码（String 类型，成功为 "200"） */
    private String code;

    /** 提示信息 */
    private String msg;

    /** 业务数据 */
    private T data;

    private Result() {
    }

    private Result(String code, String msg, T data) {
        this.code = code;
        this.msg = msg;
        this.data = data;
    }

    /**
     * 成功（无数据）
     */
    public static <T> Result<T> success() {
        return new Result<>(SUCCESS_CODE, "success", null);
    }

    /**
     * 成功（带数据）
     *
     * @param data 业务数据
     */
    public static <T> Result<T> success(T data) {
        return new Result<>(SUCCESS_CODE, "success", data);
    }

    /**
     * 失败（指定码与文案）
     *
     * @param code 错误码
     * @param msg  错误信息
     */
    public static <T> Result<T> error(String code, String msg) {
        return new Result<>(code, msg, null);
    }

    /**
     * 失败（取错误码枚举的默认码与文案）
     *
     * @param errCode 错误码枚举
     */
    public static <T> Result<T> error(ErrCode errCode) {
        return new Result<>(errCode.getCode(), errCode.getMsg(), null);
    }

    /**
     * 是否成功
     */
    public boolean isSuccess() {
        return SUCCESS_CODE.equals(this.code);
    }
}
