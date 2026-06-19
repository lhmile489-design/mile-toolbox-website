package com.example.miletoolboxendproject.domain;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;
import java.util.Date;

/**
 * 文件处理任务记录。
 * <p>记录后端文件工具（PDF/图片/文档）的同步处理流水，供后台「文件任务监控」使用。
 * <p>由 {@code @TrackFileTask} AOP 切面落库，记录失败不影响主流程。
 */
@Data
@TableName("tool_file_task")
public class ToolFileTask implements Serializable {

    /** 任务ID */
    @TableId(type = IdType.AUTO)
    private Long id;

    /** 异步任务UUID（同步流水为空） */
    private String taskId;

    /** 工具标识（如 pdf-merge） */
    private String toolKey;

    /** 是否异步任务：0同步流水 1异步任务 */
    private Integer async;

    /** 输入文件名（多文件取首个 + 数量） */
    private String fileName;

    /** 输入文件总大小（字节） */
    private Long fileSize;

    /** 输入文件数量 */
    private Integer fileCount;

    /** 状态：0成功 1失败 2待处理(PENDING) 3处理中(PROCESSING) */
    private Integer status;

    /** 进度百分比 0-100（异步任务） */
    private Integer progress;

    /** 失败原因（status=1 时） */
    private String errorMsg;

    /** 产物文件名（异步成功后） */
    private String resultName;

    /** 产物COS URL（启用对象存储时） */
    private String resultUrl;

    /** 产物本地临时路径（未启用COS时） */
    private String resultPath;

    /** 产物MIME类型 */
    private String resultType;

    /** 产物过期时间（到期清理） */
    private Date expireTime;

    /** 处理耗时（毫秒） */
    private Long costMs;

    /** 处理用户ID（游客为空） */
    private Long userId;

    /** 客户端IP */
    private String clientIp;

    /** 创建时间 */
    private Date createTime;
}
