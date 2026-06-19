package com.example.miletoolboxendproject.config;

import com.qcloud.cos.COSClient;
import com.qcloud.cos.ClientConfig;
import com.qcloud.cos.auth.BasicCOSCredentials;
import com.qcloud.cos.auth.COSCredentials;
import com.qcloud.cos.region.Region;
import jakarta.annotation.Resource;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * 腾讯云 COS 客户端配置。
 * <p>仅当 {@code toolbox.cos.enabled=true} 时创建 {@link COSClient} bean；
 * 未启用时不创建，存储服务回退为「直接返回文件流」。
 */
@Configuration
public class CosConfig {

    @Resource
    private ToolboxProperties toolboxProperties;

    @Bean(destroyMethod = "shutdown")
    @ConditionalOnProperty(prefix = "toolbox.cos", name = "enabled", havingValue = "true")
    public COSClient cosClient() {
        ToolboxProperties.Cos cos = toolboxProperties.getCos();
        COSCredentials cred = new BasicCOSCredentials(cos.getSecretId(), cos.getSecretKey());
        ClientConfig clientConfig = new ClientConfig(new Region(cos.getRegion()));
        clientConfig.setHttpProtocol(com.qcloud.cos.http.HttpProtocol.https);
        return new COSClient(cred, clientConfig);
    }
}
