package com.example.miletoolboxendproject.config;

import cn.dev33.satoken.interceptor.SaInterceptor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Web 配置：注册 Sa-Token 注解拦截器 + 全局 CORS。
 * <p>注册 {@link SaInterceptor} 后，{@code @SaCheckLogin}/{@code @SaCheckRole} 等注解才生效。
 * 具体鉴权由各 Controller 方法上的注解声明（默认域=前台用户，type="ADMIN"=后台）。
 */
@Configuration
public class SaTokenConfig implements WebMvcConfigurer {

    /**
     * 注册 Sa-Token 注解鉴权拦截器（拦截全部请求，具体校验交给注解）
     */
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new SaInterceptor()).addPathPatterns("/**");
    }

    /**
     * 全局跨域配置（开发期放开；生产建议收紧 allowedOriginPatterns）
     */
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOriginPatterns("*")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
