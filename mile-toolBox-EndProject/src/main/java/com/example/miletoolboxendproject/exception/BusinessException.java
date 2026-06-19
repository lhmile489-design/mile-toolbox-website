package com.example.miletoolboxendproject.exception;

import lombok.Getter;

/**
 * 业务异常。由 {@link GlobExceptionHandler} 兜底转为统一 Result。
 * <p><b>踩坑警示</b>：自定义文案不能被吞掉——{@code desc} 非空时优先用 {@code desc}，
 * 为空才回退到错误码默认 msg。若写成 {@code super(errCode.getMsg())} 会导致所有自定义
 * 文案丢失，前端永远只看到默认提示。
 */
@Getter
public class BusinessException extends RuntimeException {

    /** 错误码 */
    private final String code;

    /**
     * 带自定义文案
     *
     * @param errCode 错误码枚举
     * @param desc    自定义文案（为空则用枚举默认 msg）
     */
    public BusinessException(ErrCode errCode, String desc) {
        super((desc == null || desc.isBlank()) ? errCode.getMsg() : desc);
        this.code = errCode.getCode();
    }

    /**
     * 用错误码默认文案
     *
     * @param errCode 错误码枚举
     */
    public BusinessException(ErrCode errCode) {
        super(errCode.getMsg());
        this.code = errCode.getCode();
    }
}
