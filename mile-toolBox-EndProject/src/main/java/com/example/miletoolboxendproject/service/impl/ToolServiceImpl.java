package com.example.miletoolboxendproject.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.UpdateWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.miletoolboxendproject.domain.Tool;
import com.example.miletoolboxendproject.domain.ToolCategory;
import com.example.miletoolboxendproject.exception.BusinessException;
import com.example.miletoolboxendproject.exception.ErrCode;
import com.example.miletoolboxendproject.mapper.ToolCategoryMapper;
import com.example.miletoolboxendproject.mapper.ToolMapper;
import com.example.miletoolboxendproject.service.ToolFavoriteService;
import com.example.miletoolboxendproject.service.ToolService;
import com.example.miletoolboxendproject.service.ToolUsageRecordService;
import com.example.miletoolboxendproject.vo.ToolVO;
import jakarta.annotation.Resource;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * 工具服务实现。
 */
@Service
public class ToolServiceImpl extends ServiceImpl<ToolMapper, Tool> implements ToolService {

    @Resource
    private ToolCategoryMapper toolCategoryMapper;

    @Resource
    private ToolFavoriteService favoriteService;

    @Resource
    private ToolUsageRecordService usageRecordService;

    @Override
    public List<ToolCategory> listCategories() {
        QueryWrapper<ToolCategory> qw = new QueryWrapper<>();
        qw.eq("status", 0).orderByAsc("sort");
        return toolCategoryMapper.selectList(qw);
    }

    @Override
    public List<ToolVO> listTools(Long categoryId, String keyword, Long userId) {
        QueryWrapper<Tool> qw = new QueryWrapper<>();
        qw.eq("status", 0);
        if (categoryId != null) {
            qw.eq("categoryId", categoryId);
        }
        if (keyword != null && !keyword.isBlank()) {
            qw.and(w -> w.like("name", keyword).or().like("description", keyword));
        }
        qw.orderByAsc("sort");
        List<Tool> tools = this.list(qw);
        return toVOList(tools, userId);
    }

    @Override
    public ToolVO detail(String toolKey, Long userId) {
        Tool tool = getByToolKey(toolKey);
        if (tool == null) {
            throw new BusinessException(ErrCode.TOOL_NOT_FOUND);
        }
        if (tool.getStatus() != null && tool.getStatus() == 1) {
            throw new BusinessException(ErrCode.TOOL_OFFLINE);
        }
        Set<Long> favIds = new HashSet<>(favoriteService.listFavoriteToolIds(userId));
        return ToolVO.of(tool, favIds.contains(tool.getId()));
    }

    @Override
    public List<ToolVO> hotTools(int limit, Long userId) {
        int safeLimit = Math.min(Math.max(limit, 1), 50);
        QueryWrapper<Tool> qw = new QueryWrapper<>();
        qw.eq("status", 0).orderByDesc("useCount").last("limit " + safeLimit);
        return toVOList(this.list(qw), userId);
    }

    @Override
    public List<ToolVO> hotToolsByUsers(int limit, Long userId) {
        int safeLimit = Math.min(Math.max(limit, 1), 50);
        List<Long> rankedIds = usageRecordService.rankToolIdsByDistinctUser(safeLimit);
        if (rankedIds.isEmpty()) {
            return Collections.emptyList();
        }
        // 批量查工具，按排名顺序装配，过滤已下架
        Map<Long, Tool> toolMap = this.listByIds(rankedIds).stream()
                .filter(t -> t.getStatus() == null || t.getStatus() == 0)
                .collect(Collectors.toMap(Tool::getId, Function.identity()));
        Set<Long> favIds = new HashSet<>(favoriteService.listFavoriteToolIds(userId));
        List<ToolVO> result = new ArrayList<>();
        for (Long id : rankedIds) {
            Tool t = toolMap.get(id);
            if (t != null) {
                result.add(ToolVO.of(t, favIds.contains(id)));
            }
        }
        return result;
    }

    @Override
    public List<ToolVO> recentTools(Long userId, int limit) {
        int safeLimit = Math.min(Math.max(limit, 1), 50);
        List<Long> toolIds = usageRecordService.listRecentToolIds(userId, safeLimit);
        if (toolIds.isEmpty()) {
            return Collections.emptyList();
        }
        // 批量查工具，按 toolIds 的顺序装配（保持最近优先），过滤已下架
        Map<Long, Tool> toolMap = this.listByIds(toolIds).stream()
                .filter(t -> t.getStatus() == null || t.getStatus() == 0)
                .collect(Collectors.toMap(Tool::getId, Function.identity()));
        Set<Long> favIds = new HashSet<>(favoriteService.listFavoriteToolIds(userId));
        List<ToolVO> result = new ArrayList<>();
        for (Long id : toolIds) {
            Tool t = toolMap.get(id);
            if (t != null) {
                result.add(ToolVO.of(t, favIds.contains(id)));
            }
        }
        return result;
    }

    @Override
    public List<ToolVO> favoriteTools(Long userId) {
        List<Long> toolIds = favoriteService.listFavoriteToolIds(userId);
        if (toolIds.isEmpty()) {
            return Collections.emptyList();
        }
        List<Tool> tools = this.listByIds(toolIds);
        // 收藏列表里所有工具的 favorited 恒为 true
        return tools.stream().map(t -> ToolVO.of(t, true)).collect(Collectors.toList());
    }

    @Override
    public void reportUse(String toolKey, Long userId) {
        Tool tool = getByToolKey(toolKey);
        if (tool == null) {
            throw new BusinessException(ErrCode.TOOL_NOT_FOUND);
        }
        // 累计使用次数原子自增（禁止先查后改）
        UpdateWrapper<Tool> uw = new UpdateWrapper<>();
        uw.eq("toolKey", toolKey).setSql("useCount = useCount + 1");
        this.update(uw);
        // 记录使用（游客 userId 为空，仅统计不入个人历史）
        usageRecordService.addRecord(userId, tool.getId(), toolKey);
    }

    // ===== 后台管理 =====

    @Override
    public com.example.miletoolboxendproject.common.PageResult<Tool> adminPage(
            int page, int size, Long categoryId, String keyword) {
        QueryWrapper<Tool> qw = new QueryWrapper<>();
        if (categoryId != null) {
            qw.eq("categoryId", categoryId);
        }
        if (keyword != null && !keyword.isBlank()) {
            qw.and(w -> w.like("name", keyword).or().like("toolKey", keyword).or().like("description", keyword));
        }
        qw.orderByAsc("sort");
        Page<Tool> p = this.page(new Page<>(page, size), qw);
        return com.example.miletoolboxendproject.common.PageResult.of(p);
    }

    @Override
    public Tool adminCreate(Tool tool) {
        if (tool.getToolKey() == null || tool.getToolKey().isBlank()) {
            throw new BusinessException(ErrCode.PARAM_ERROR, "工具标识不能为空");
        }
        QueryWrapper<Tool> qw = new QueryWrapper<>();
        qw.eq("toolKey", tool.getToolKey());
        if (this.count(qw) > 0) {
            throw new BusinessException(ErrCode.PARAM_ERROR, "工具标识已存在");
        }
        tool.setId(null);
        if (tool.getStatus() == null) tool.setStatus(0);
        if (tool.getSort() == null) tool.setSort(0);
        if (tool.getUseCount() == null) tool.setUseCount(0L);
        if (tool.getHandleType() == null) tool.setHandleType(0);
        this.save(tool);
        return tool;
    }

    @Override
    public Tool adminUpdate(Tool tool) {
        if (tool.getId() == null) {
            throw new BusinessException(ErrCode.PARAM_ERROR, "工具ID不能为空");
        }
        Tool exist = this.getById(tool.getId());
        if (exist == null) {
            throw new BusinessException(ErrCode.TOOL_NOT_FOUND);
        }
        // toolKey 若变更需校验唯一
        if (tool.getToolKey() != null && !tool.getToolKey().equals(exist.getToolKey())) {
            QueryWrapper<Tool> qw = new QueryWrapper<>();
            qw.eq("toolKey", tool.getToolKey());
            if (this.count(qw) > 0) {
                throw new BusinessException(ErrCode.PARAM_ERROR, "工具标识已存在");
            }
        }
        // useCount 不允许通过更新接口篡改
        tool.setUseCount(null);
        this.updateById(tool);
        return this.getById(tool.getId());
    }

    @Override
    public void adminChangeStatus(Long id, Integer status) {
        if (id == null || status == null) {
            throw new BusinessException(ErrCode.PARAM_ERROR, "参数不能为空");
        }
        if (this.getById(id) == null) {
            throw new BusinessException(ErrCode.TOOL_NOT_FOUND);
        }
        Tool update = new Tool();
        update.setId(id);
        update.setStatus(status);
        this.updateById(update);
    }

    @Override
    public void adminDelete(Long id) {
        if (id == null) {
            throw new BusinessException(ErrCode.PARAM_ERROR, "工具ID不能为空");
        }
        this.removeById(id);
    }

    /**
     * 按 toolKey 查工具
     */
    private Tool getByToolKey(String toolKey) {
        QueryWrapper<Tool> qw = new QueryWrapper<>();
        qw.eq("toolKey", toolKey);
        return this.getOne(qw);
    }

    /**
     * 工具列表转 VO，批量标记是否已收藏（避免 N+1）
     */
    private List<ToolVO> toVOList(List<Tool> tools, Long userId) {
        if (tools == null || tools.isEmpty()) {
            return Collections.emptyList();
        }
        Set<Long> favIds = new HashSet<>(favoriteService.listFavoriteToolIds(userId));
        List<ToolVO> list = new ArrayList<>(tools.size());
        for (Tool t : tools) {
            list.add(ToolVO.of(t, favIds.contains(t.getId())));
        }
        return list;
    }
}
