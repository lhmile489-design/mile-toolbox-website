package com.example.miletoolboxendproject.vo;

import com.example.miletoolboxendproject.domain.Tool;
import lombok.Data;

import java.io.Serializable;

/**
 * 工具出参。在工具实体基础上附加"当前用户是否已收藏"。
 */
@Data
public class ToolVO implements Serializable {

    /** 工具ID */
    private Long id;

    /** 工具唯一标识 */
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

    /** 当前用户是否已收藏（未登录恒为 false） */
    private Boolean favorited;

    /**
     * 由实体转换
     *
     * @param tool      工具实体
     * @param favorited 是否已收藏
     */
    public static ToolVO of(Tool tool, boolean favorited) {
        ToolVO vo = new ToolVO();
        vo.setId(tool.getId());
        vo.setToolKey(tool.getToolKey());
        vo.setName(tool.getName());
        vo.setNameEn(tool.getNameEn());
        vo.setCategoryId(tool.getCategoryId());
        vo.setDescription(tool.getDescription());
        vo.setDescriptionEn(tool.getDescriptionEn());
        vo.setIcon(tool.getIcon());
        vo.setHandleType(tool.getHandleType());
        vo.setRoutePath(tool.getRoutePath());
        vo.setUseCount(tool.getUseCount());
        vo.setFavorited(favorited);
        return vo;
    }
}
