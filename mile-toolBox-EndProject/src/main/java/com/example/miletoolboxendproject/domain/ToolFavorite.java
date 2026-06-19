package com.example.miletoolboxendproject.domain;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;
import java.util.Date;

/**
 * 用户收藏实体。
 */
@Data
@TableName("tool_favorite")
public class ToolFavorite implements Serializable {

    /** 收藏ID */
    @TableId(type = IdType.AUTO)
    private Long id;

    /** 用户ID */
    private Long userId;

    /** 工具ID */
    private Long toolId;

    /** 收藏时间 */
    private Date createTime;
}
