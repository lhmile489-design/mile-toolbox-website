package com.example.miletoolboxendproject.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * 工具箱业务配置（对应 application.yml 的 toolbox.*）。
 */
@Data
@Component
@ConfigurationProperties(prefix = "toolbox")
public class ToolboxProperties {

    /** 临时文件目录 */
    private String tempDir = "./tmp";

    /** 临时文件 TTL（秒） */
    private long tempTtlSeconds = 3600;

    /** 用户使用历史保留上限（条/人） */
    private int usageRecordLimit = 200;

    /** 文档转换（Pandoc）配置 */
    private Pandoc pandoc = new Pandoc();

    /**
     * Pandoc 文档转换配置。
     */
    @Data
    public static class Pandoc {
        /** 是否启用（服务器未装 Pandoc 时关闭，doc-convert 返回未就绪） */
        private boolean enabled = false;
        /** pandoc 可执行文件路径（在 PATH 中可直接写 "pandoc"） */
        private String path = "pandoc";
        /** 单次转换超时（秒） */
        private int timeoutSeconds = 60;
    }

    /** 维智地图配置 */
    private Wayz wayz = new Wayz();

    /**
     * 维智地图（Wayz）配置。
     */
    @Data
    public static class Wayz {
        /** 服务基址 */
        private String baseUrl = "https://api.newayz.com";
        /** 应用 app-key（access_key），仅存本地配置 */
        private String appKey;
    }

    /** 接口盒子（apihz.cn）配置：手机号归属地等 */
    private Apihz apihz = new Apihz();

    /**
     * 接口盒子（apihz.cn）配置。
     */
    @Data
    public static class Apihz {
        /** 服务基址 */
        private String baseUrl = "https://cn.apihz.cn";
        /** 用户中心数字 ID（默认公共测试号，有频次限制；生产填专属，走本地配置） */
        private String id = "88888888";
        /** 通讯秘钥（默认公共测试号；生产填专属，走本地配置） */
        private String key = "88888888";
    }

    /** 腾讯云 COS 对象存储配置 */
    private Cos cos = new Cos();

    /**
     * 腾讯云 COS 配置。secretId/secretKey 仅存本地配置，不进仓库。
     */
    @Data
    public static class Cos {
        /** 是否启用 COS（未配置密钥时关闭，文件处理回退为直接返回流） */
        private boolean enabled = false;
        /** 地域，如 ap-guangzhou */
        private String region;
        /** 存储桶名，如 jiwei-1390019213 */
        private String bucket;
        /** 访问密钥 ID */
        private String secretId;
        /** 访问密钥 Key */
        private String secretKey;
        /** 对象存储路径前缀（产物归类） */
        private String prefix = "toolbox/";
    }
}
