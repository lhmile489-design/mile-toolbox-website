package com.example.miletoolboxendproject.service;

import com.example.miletoolboxendproject.vo.ZipcodeVO;

import java.util.List;

/**
 * 邮编查询服务（本地行政区划+邮编数据集，离线）。
 */
public interface ZipcodeService {

    /**
     * 按关键词查询邮编。
     * <p>关键词可为区县/城市/省份名（模糊匹配），或直接是邮编数字（精确/前缀匹配）。
     *
     * @param keyword 关键词
     * @return 匹配的邮编列表（最多 50 条）
     */
    List<ZipcodeVO> query(String keyword);
}
