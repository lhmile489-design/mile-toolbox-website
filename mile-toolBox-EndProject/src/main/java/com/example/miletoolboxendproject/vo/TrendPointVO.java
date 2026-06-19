package com.example.miletoolboxendproject.vo;

import lombok.Data;

import java.io.Serializable;

/**
 * 使用趋势数据点。
 */
@Data
public class TrendPointVO implements Serializable {

    /** 日期（yyyy-MM-dd） */
    private String date;

    /** 当日使用次数 */
    private long count;

    public TrendPointVO(String date, long count) {
        this.date = date;
        this.count = count;
    }
}
