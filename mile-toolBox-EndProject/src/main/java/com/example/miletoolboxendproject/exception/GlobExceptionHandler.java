package com.example.miletoolboxendproject.exception;

import cn.dev33.satoken.exception.NotLoginException;
import cn.dev33.satoken.exception.NotPermissionException;
import cn.dev33.satoken.exception.NotRoleException;
import com.example.miletoolboxendproject.common.Result;
import lombok.extern.slf4j.Slf4j;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

/**
 * 全局异常处理。
 * <p>映射规则（见 docs/错误码与响应规范.md §6）：
 * <ul>
 *   <li>{@link BusinessException} → 自带 code + 自定义 msg</li>
 *   <li>{@link NotLoginException} → 10005（前端据此登出）</li>
 *   <li>{@link NotPermissionException}/{@link NotRoleException} → 10007（不登出）</li>
 *   <li>文件超限 → 10302</li>
 *   <li>参数校验失败 → 10001</li>
 *   <li>其余 RuntimeException → 10010（系统错误，不登出）</li>
 * </ul>
 */
@Slf4j
@RestControllerAdvice
public class GlobExceptionHandler {

    /**
     * 业务异常：保留自带 code 与自定义 msg
     */
    @ExceptionHandler(BusinessException.class)
    public Result<Void> handleBusiness(BusinessException e) {
        log.warn("业务异常 code={}, msg={}", e.getCode(), e.getMessage());
        return Result.error(e.getCode(), e.getMessage());
    }

    /**
     * 未登录：独立鉴权码，前端据此登出
     */
    @ExceptionHandler(NotLoginException.class)
    public Result<Void> handleNotLogin(NotLoginException e) {
        return Result.error(ErrCode.NOT_LOGIN);
    }

    /**
     * 无权限 / 无角色
     */
    @ExceptionHandler({NotPermissionException.class, NotRoleException.class})
    public Result<Void> handleNoPermission(Exception e) {
        return Result.error(ErrCode.NO_PERMISSION);
    }

    /**
     * 文件超限（Spring 在进 Controller 前抛出，业务 try/catch 拦不到）
     */
    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public Result<Void> handleMaxUpload(MaxUploadSizeExceededException e) {
        return Result.error(ErrCode.FILE_TOO_LARGE);
    }

    /**
     * 路由不存在：返回清晰的 404，而非笼统的系统错误（避免把"接口不存在/实例陈旧"误报为"系统繁忙"）
     */
    @ExceptionHandler(NoResourceFoundException.class)
    public Result<Void> handleNoResource(NoResourceFoundException e) {
        return Result.error("404", "接口不存在：" + e.getResourcePath());
    }

    /**
     * 参数校验失败（@Valid）
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public Result<Void> handleValid(MethodArgumentNotValidException e) {
        FieldError fieldError = e.getBindingResult().getFieldError();
        String msg = fieldError != null ? fieldError.getDefaultMessage() : ErrCode.PARAM_ERROR.getMsg();
        return Result.error(ErrCode.PARAM_ERROR.getCode(), msg);
    }

    /**
     * 兜底：系统错误（独立于鉴权码，不登出）
     */
    @ExceptionHandler(Exception.class)
    public Result<Void> handleException(Exception e) {
        log.error("系统异常", e);
        return Result.error(ErrCode.SYSTEM_ERROR);
    }
}
