package com.example.miletoolboxendproject.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.example.miletoolboxendproject.domain.ToolCategory;

import java.util.List;

/**
 * 工具分类服务（后台管理用）。
 */
public interface ToolCategoryService extends IService<ToolCategory> {

    /**
     * 后台分类列表（含停用，按 sort 升序）
     */
    List<ToolCategory> adminList();

    /**
     * 新增分类（code 唯一校验）
     */
    ToolCategory adminCreate(ToolCategory category);

    /**
     * 更新分类
     */
    ToolCategory adminUpdate(ToolCategory category);

    /**
     * 删除分类（分类下有工具时禁止删除）
     */
    void adminDelete(Long id);
}
