package com.example.miletoolboxendproject.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.miletoolboxendproject.domain.ToolFavorite;
import org.apache.ibatis.annotations.Mapper;

/**
 * 用户收藏 Mapper。
 */
@Mapper
public interface ToolFavoriteMapper extends BaseMapper<ToolFavorite> {
}
