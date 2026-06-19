package com.example.miletoolboxendproject.domain;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;
import java.util.Date;

/**
 * 工具实体。前后端共享清单的来源。
 */
@Data
@TableName("tool")
public class Tool implements Serializable {

    /** 工具ID */
    @TableId(type = IdType.AUTO)
    private Long id;

    /** 工具唯一标识（前后端共享，如 pdf-merge） */
    private String toolKey;

    /** 工具名称 */
    private String name;

    /** 工具名称（英文） */
    private String nameEn;

    /** 所属分类ID */
    private Long categoryId;

    /** 工具描述 */
    private String description;

    /** 工具描述（英文） */
    private String descriptionEn;

    /** 图标标识 */
    private String icon;

    /** 处理位置：0前端 1后端 */
    private Integer handleType;

    /** 前端路由路径 */
    private String routePath;

    /** 累计使用次数 */
    private Long useCount;

    /** 状态：0上架 1下架 */
    private Integer status;

    /** 排序（升序） */
    private Integer sort;

    /** 创建时间 */
    private Date createTime;

    /** 更新时间 */
    private Date updateTime;
}
