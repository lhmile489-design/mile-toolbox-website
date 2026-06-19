package com.example.miletoolboxendproject.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.miletoolboxendproject.domain.ToolUser;
import org.apache.ibatis.annotations.Mapper;

/**
 * 前台用户 Mapper。
 */
@Mapper
public interface ToolUserMapper extends BaseMapper<ToolUser> {
}
