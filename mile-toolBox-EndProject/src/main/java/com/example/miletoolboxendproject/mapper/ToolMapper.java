package com.example.miletoolboxendproject.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.miletoolboxendproject.domain.Tool;
import org.apache.ibatis.annotations.Mapper;

/**
 * 工具 Mapper。
 */
@Mapper
public interface ToolMapper extends BaseMapper<Tool> {
}
