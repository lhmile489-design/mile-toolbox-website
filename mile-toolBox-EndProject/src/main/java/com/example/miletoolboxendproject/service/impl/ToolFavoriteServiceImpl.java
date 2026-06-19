package com.example.miletoolboxendproject.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.miletoolboxendproject.domain.ToolFavorite;
import com.example.miletoolboxendproject.exception.BusinessException;
import com.example.miletoolboxendproject.exception.ErrCode;
import com.example.miletoolboxendproject.mapper.ToolFavoriteMapper;
import com.example.miletoolboxendproject.service.ToolFavoriteService;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 用户收藏服务实现。
 */
@Service
public class ToolFavoriteServiceImpl extends ServiceImpl<ToolFavoriteMapper, ToolFavorite>
        implements ToolFavoriteService {

    @Override
    public void favorite(Long userId, Long toolId) {
        QueryWrapper<ToolFavorite> qw = new QueryWrapper<>();
        qw.eq("userId", userId).eq("toolId", toolId);
        if (this.count(qw) > 0) {
            throw new BusinessException(ErrCode.FAVORITE_EXISTS);
        }
        ToolFavorite favorite = new ToolFavorite();
        favorite.setUserId(userId);
        favorite.setToolId(toolId);
        this.save(favorite);
    }

    @Override
    public void unfavorite(Long userId, Long toolId) {
        QueryWrapper<ToolFavorite> qw = new QueryWrapper<>();
        qw.eq("userId", userId).eq("toolId", toolId);
        if (this.count(qw) == 0) {
            throw new BusinessException(ErrCode.FAVORITE_NOT_FOUND);
        }
        this.remove(qw);
    }

    @Override
    public List<Long> listFavoriteToolIds(Long userId) {
        if (userId == null) {
            return Collections.emptyList();
        }
        QueryWrapper<ToolFavorite> qw = new QueryWrapper<>();
        qw.eq("userId", userId).select("toolId");
        return this.list(qw).stream()
                .map(ToolFavorite::getToolId)
                .collect(Collectors.toList());
    }
}
