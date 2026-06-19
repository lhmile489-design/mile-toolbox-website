package com.example.miletoolboxendproject.service.impl;

import com.example.miletoolboxendproject.exception.BusinessException;
import com.example.miletoolboxendproject.exception.ErrCode;
import com.example.miletoolboxendproject.service.ZipcodeService;
import com.example.miletoolboxendproject.vo.ZipcodeVO;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StreamUtils;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

/**
 * 邮编查询服务实现。
 * <p>启动时把 classpath 下的 china-zipcode.json（省→市→区三级，区县带 zipcode）
 * 展平为内存列表，查询时按区县/市/省名模糊匹配或按邮编前缀匹配。数据离线、无外部依赖。
 */
@Slf4j
@Service
public class ZipcodeServiceImpl implements ZipcodeService {

    private static final ObjectMapper MAPPER = new ObjectMapper();
    private static final int MAX_RESULT = 50;

    /** 展平后的全部邮编条目（不可变，启动后只读） */
    private List<ZipcodeVO> entries = List.of();

    @PostConstruct
    public void init() {
        try {
            ClassPathResource resource = new ClassPathResource("china-zipcode.json");
            String json = StreamUtils.copyToString(resource.getInputStream(), StandardCharsets.UTF_8);
            this.entries = flatten(json);
            log.info("邮编数据加载成功，区县条目数={}", entries.size());
        } catch (Exception e) {
            log.error("邮编数据加载失败", e);
        }
    }

    /** 展平省→市→区三级 JSON 为区县级条目列表 */
    List<ZipcodeVO> flatten(String json) throws Exception {
        List<ZipcodeVO> list = new ArrayList<>();
        JsonNode provinces = MAPPER.readTree(json);
        for (JsonNode prov : provinces) {
            String province = text(prov, "name");
            JsonNode cities = prov.get("child");
            if (cities == null) {
                continue;
            }
            for (JsonNode cityNode : cities) {
                String city = text(cityNode, "name");
                JsonNode districts = cityNode.get("child");
                if (districts == null) {
                    // 部分直辖市/特殊地区可能市级直接带 zipcode
                    String zip = text(cityNode, "zipcode");
                    if (zip != null) {
                        list.add(new ZipcodeVO(zip, province, city, null));
                    }
                    continue;
                }
                for (JsonNode dist : districts) {
                    String district = text(dist, "name");
                    String zip = text(dist, "zipcode");
                    if (zip != null && !zip.isBlank()) {
                        list.add(new ZipcodeVO(zip, province, city, district));
                    }
                }
            }
        }
        return list;
    }

    @Override
    public List<ZipcodeVO> query(String keyword) {
        if (keyword == null || keyword.isBlank()) {
            throw new BusinessException(ErrCode.PARAM_ERROR, "查询关键词不能为空");
        }
        String kw = keyword.trim();
        boolean numeric = kw.chars().allMatch(Character::isDigit);
        List<ZipcodeVO> result = new ArrayList<>();
        for (ZipcodeVO e : entries) {
            boolean match;
            if (numeric) {
                match = e.getZipcode() != null && e.getZipcode().startsWith(kw);
            } else {
                match = contains(e.getDistrict(), kw)
                        || contains(e.getCity(), kw)
                        || contains(e.getProvince(), kw);
            }
            if (match) {
                result.add(e);
                if (result.size() >= MAX_RESULT) {
                    break;
                }
            }
        }
        if (result.isEmpty()) {
            throw new BusinessException(ErrCode.LOCATION_NOT_FOUND, "未查询到匹配的邮编");
        }
        return result;
    }

    private boolean contains(String s, String kw) {
        return s != null && s.contains(kw);
    }

    private String text(JsonNode node, String field) {
        JsonNode v = node.get(field);
        return (v == null || v.isNull()) ? null : v.asText();
    }
}
