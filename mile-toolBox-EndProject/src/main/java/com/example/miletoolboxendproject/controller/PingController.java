package com.example.miletoolboxendproject.controller;

import cn.dev33.satoken.annotation.SaIgnore;
import com.example.miletoolboxendproject.common.Result;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

/**
 * 健康检查接口。用于验证应用启动与基础装配（无需登录）。
 */
@RestController
@RequestMapping("/ping")
public class PingController {

    /**
     * 健康检查
     *
     * @return 应用状态
     */
    @SaIgnore
    @GetMapping
    public Result<Map<String, Object>> ping() {
        Map<String, Object> data = new HashMap<>();
        data.put("status", "UP");
        data.put("app", "mile-toolBox-EndProject");
        data.put("time", System.currentTimeMillis());
        return Result.success(data);
    }
}
