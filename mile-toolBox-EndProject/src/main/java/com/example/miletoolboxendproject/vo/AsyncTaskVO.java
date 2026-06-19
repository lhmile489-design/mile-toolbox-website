package com.example.miletoolboxendproject.vo;

import com.example.miletoolboxendproject.domain.ToolFileTask;
import lombok.Data;

import java.io.Serializable;

/**
 * 异步文件任务状态（轮询返回）。
 */
@Data
public class AsyncTaskVO implements Serializable {

    /** 任务UUID */
    private String taskId;

    /** 工具标识 */
    private String toolKey;

    /** 状态：0成功 1失败 2待处理 3处理中 */
    private Integer status;

    /** 状态文本：SUCCESS/FAIL/PENDING/PROCESSING */
    private String statusText;

    /** 进度百分比 0-100 */
    private Integer progress;

    /** 失败原因（status=1 时） */
    private String errorMsg;

    /** 产物文件名（成功后） */
    private String resultName;

    /** 产物可访问 URL（启用 COS 且成功时；否则用 /file/download/{taskId} 下载） */
    private String resultUrl;

    /** 是否可下载（成功且产物可取） */
    private Boolean downloadable;

    /**
     * 由实体转换（不暴露本地路径等内部字段）。
     */
    public static AsyncTaskVO of(ToolFileTask t) {
        AsyncTaskVO vo = new AsyncTaskVO();
        vo.setTaskId(t.getTaskId());
        vo.setToolKey(t.getToolKey());
        vo.setStatus(t.getStatus());
        vo.setStatusText(statusText(t.getStatus()));
        vo.setProgress(t.getProgress());
        vo.setErrorMsg(t.getErrorMsg());
        vo.setResultName(t.getResultName());
        vo.setResultUrl(t.getResultUrl());
        boolean ok = t.getStatus() != null && t.getStatus() == 0;
        boolean hasProduct = t.getResultUrl() != null || t.getResultPath() != null;
        vo.setDownloadable(ok && hasProduct);
        return vo;
    }

    private static String statusText(Integer status) {
        if (status == null) {
            return "UNKNOWN";
        }
        return switch (status) {
            case 0 -> "SUCCESS";
            case 1 -> "FAIL";
            case 2 -> "PENDING";
            case 3 -> "PROCESSING";
            default -> "UNKNOWN";
        };
    }
}
