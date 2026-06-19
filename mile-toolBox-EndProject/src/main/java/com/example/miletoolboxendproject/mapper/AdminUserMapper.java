package com.example.miletoolboxendproject.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.miletoolboxendproject.domain.AdminUser;
import org.apache.ibatis.annotations.Mapper;

/**
 * 后台管理员 Mapper。
 */
@Mapper
public interface AdminUserMapper extends BaseMapper<AdminUser> {
}
