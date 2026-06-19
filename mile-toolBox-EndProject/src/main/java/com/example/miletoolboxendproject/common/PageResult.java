package com.example.miletoolboxendproject.common;

import com.baomidou.mybatisplus.core.metadata.IPage;
import lombok.Data;

import java.io.Serializable;
import java.util.Collections;
import java.util.List;

/**
 * 统一分页结果。
 *
 * @param <T> 列表元素类型
 */
@Data
public class PageResult<T> implements Serializable {

    /** 当前页数据 */
    private List<T> list;

    /** 总记录数 */
    private long total;

    /** 当前页码 */
    private long page;

    /** 每页大小 */
    private long size;

    public PageResult() {
    }

    public PageResult(List<T> list, long total, long page, long size) {
        this.list = list;
        this.total = total;
        this.page = page;
        this.size = size;
    }

    /**
     * 由 MyBatis-Plus 的 IPage 转换
     *
     * @param page MyBatis-Plus 分页对象
     */
    public static <T> PageResult<T> of(IPage<T> page) {
        return new PageResult<>(page.getRecords(), page.getTotal(), page.getCurrent(), page.getSize());
    }

    /**
     * 空结果
     */
    public static <T> PageResult<T> empty(long page, long size) {
        return new PageResult<>(Collections.emptyList(), 0L, page, size);
    }
}
