package com.example.miletoolboxendproject.domain;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;
import java.util.Date;

/**
 * 工具分类实体。
 */
@Data
@TableName("tool_category")
public class ToolCategory implements Serializable {

    /** 分类ID */
    @TableId(type = IdType.AUTO)
    private Long id;

    /** 分类编码：query/convert/file/color/crypto/dev/text */
    private String code;

    /** 分类名称 */
    private String name;

    /** 分类名称（英文） */
    private String nameEn;

    /** 图标标识 */
    private String icon;

    /** 排序（升序） */
    private Integer sort;

    /** 状态：0启用 1停用 */
    private Integer status;

    /** 创建时间 */
    private Date createTime;
}
