package com.example.miletoolboxendproject.domain;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;
import java.util.Date;

/**
 * 工具使用记录实体。最近使用 + 使用统计来源。
 */
@Data
@TableName("tool_usage_record")
public class ToolUsageRecord implements Serializable {

    /** 记录ID */
    @TableId(type = IdType.AUTO)
    private Long id;

    /** 用户ID（游客为空） */
    private Long userId;

    /** 工具ID */
    private Long toolId;

    /** 工具标识（冗余，便于统计） */
    private String toolKey;

    /** 使用时间 */
    private Date createTime;
}
