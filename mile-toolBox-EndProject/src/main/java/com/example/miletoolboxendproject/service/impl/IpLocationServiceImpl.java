package com.example.miletoolboxendproject.service.impl;

import com.example.miletoolboxendproject.exception.BusinessException;
import com.example.miletoolboxendproject.exception.ErrCode;
import com.example.miletoolboxendproject.service.IpLocationService;
import com.example.miletoolboxendproject.vo.IpLocationVO;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import lombok.extern.slf4j.Slf4j;
import org.lionsoul.ip2region.xdb.Searcher;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StreamUtils;

import java.util.regex.Pattern;

/**
 * IP 归属地查询服务实现（ip2region 2.7.0）。
 * <p>启动时把 xdb 整个加载进内存，构建基于内存的 {@link Searcher}（线程安全、查询快）。
 * <p>xdb 返回固定格式字符串：{@code 国家|区域|省份|城市|ISP}，"区域"通常为 0。
 */
@Slf4j
@Service
public class IpLocationServiceImpl implements IpLocationService {

    /** 简单 IPv4 校验 */
    private static final Pattern IPV4 = Pattern.compile(
            "^((25[0-5]|2[0-4]\\d|[01]?\\d?\\d)\\.){3}(25[0-5]|2[0-4]\\d|[01]?\\d?\\d)$");

    /** 基于内存的查询器（xdb 全量载入，线程安全可共享） */
    private Searcher searcher;

    @PostConstruct
    public void init() {
        try {
            ClassPathResource resource = new ClassPathResource("ip2region.xdb");
            byte[] xdb = StreamUtils.copyToByteArray(resource.getInputStream());
            this.searcher = Searcher.newWithBuffer(xdb);
            log.info("ip2region 加载成功，xdb 字节数={}", xdb.length);
        } catch (Exception e) {
            log.error("ip2region 初始化失败", e);
        }
    }

    @PreDestroy
    public void destroy() {
        if (searcher != null) {
            try {
                searcher.close();
            } catch (Exception ignored) {
                // 忽略关闭异常
            }
        }
    }

    @Override
    public IpLocationVO query(String ip) {
        if (ip == null || !IPV4.matcher(ip.trim()).matches()) {
            throw new BusinessException(ErrCode.IP_FORMAT_ERROR);
        }
        if (searcher == null) {
            throw new BusinessException(ErrCode.SYSTEM_ERROR, "IP 库未就绪");
        }
        try {
            String region = searcher.search(ip.trim());   // 国家|区域|省份|城市|ISP
            return parse(ip.trim(), region);
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            throw new BusinessException(ErrCode.LOCATION_NOT_FOUND, "未查询到归属地信息");
        }
    }

    /**
     * 解析 ip2region 返回的「国家|区域|省份|城市|ISP」字符串。
     * 字段为空或占位 "0" 的归一化为 null。
     */
    IpLocationVO parse(String ip, String region) {
        IpLocationVO vo = new IpLocationVO();
        vo.setIp(ip);
        if (region == null || region.isBlank()) {
            return vo;
        }
        String[] parts = region.split("\\|", -1);
        vo.setCountry(norm(parts, 0));
        // parts[1] 是"区域"，通常为 0，跳过
        vo.setProvince(norm(parts, 2));
        vo.setCity(norm(parts, 3));
        vo.setIsp(norm(parts, 4));
        return vo;
    }

    private String norm(String[] parts, int idx) {
        if (idx >= parts.length) {
            return null;
        }
        String v = parts[idx];
        if (v == null) {
            return null;
        }
        v = v.trim();
        return (v.isEmpty() || "0".equals(v)) ? null : v;
    }
}
