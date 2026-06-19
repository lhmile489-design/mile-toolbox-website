package com.example.miletoolboxendproject.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.miletoolboxendproject.domain.Tool;
import com.example.miletoolboxendproject.domain.ToolCategory;
import com.example.miletoolboxendproject.exception.BusinessException;
import com.example.miletoolboxendproject.exception.ErrCode;
import com.example.miletoolboxendproject.mapper.ToolCategoryMapper;
import com.example.miletoolboxendproject.mapper.ToolMapper;
import com.example.miletoolboxendproject.service.ToolCategoryService;
import jakarta.annotation.Resource;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * 工具分类服务实现。
 */
@Service
public class ToolCategoryServiceImpl extends ServiceImpl<ToolCategoryMapper, ToolCategory>
        implements ToolCategoryService {

    @Resource
    private ToolMapper toolMapper;

    @Override
    public List<ToolCategory> adminList() {
        QueryWrapper<ToolCategory> qw = new QueryWrapper<>();
        qw.orderByAsc("sort");
        return this.list(qw);
    }

    @Override
    public ToolCategory adminCreate(ToolCategory category) {
        if (category.getCode() == null || category.getCode().isBlank()) {
            throw new BusinessException(ErrCode.PARAM_ERROR, "分类编码不能为空");
        }
        QueryWrapper<ToolCategory> qw = new QueryWrapper<>();
        qw.eq("code", category.getCode());
        if (this.count(qw) > 0) {
            throw new BusinessException(ErrCode.PARAM_ERROR, "分类编码已存在");
        }
        category.setId(null);
        if (category.getStatus() == null) category.setStatus(0);
        if (category.getSort() == null) category.setSort(0);
        this.save(category);
        return category;
    }

    @Override
    public ToolCategory adminUpdate(ToolCategory category) {
        if (category.getId() == null) {
            throw new BusinessException(ErrCode.PARAM_ERROR, "分类ID不能为空");
        }
        ToolCategory exist = this.getById(category.getId());
        if (exist == null) {
            throw new BusinessException(ErrCode.DATA_NOT_FOUND);
        }
        if (category.getCode() != null && !category.getCode().equals(exist.getCode())) {
            QueryWrapper<ToolCategory> qw = new QueryWrapper<>();
            qw.eq("code", category.getCode());
            if (this.count(qw) > 0) {
                throw new BusinessException(ErrCode.PARAM_ERROR, "分类编码已存在");
            }
        }
        this.updateById(category);
        return this.getById(category.getId());
    }

    @Override
    public void adminDelete(Long id) {
        if (id == null) {
            throw new BusinessException(ErrCode.PARAM_ERROR, "分类ID不能为空");
        }
        // 分类下有工具时禁止删除
        QueryWrapper<Tool> qw = new QueryWrapper<>();
        qw.eq("categoryId", id);
        if (toolMapper.selectCount(qw) > 0) {
            throw new BusinessException(ErrCode.PARAM_ERROR, "该分类下存在工具，无法删除");
        }
        this.removeById(id);
    }
}
