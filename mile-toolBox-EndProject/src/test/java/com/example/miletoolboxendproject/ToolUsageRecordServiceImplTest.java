package com.example.miletoolboxendproject;

import com.example.miletoolboxendproject.domain.ToolUsageRecord;
import com.example.miletoolboxendproject.service.impl.ToolUsageRecordServiceImpl;
import com.baomidou.mybatisplus.core.conditions.Wrapper;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doReturn;

/**
 * ToolUsageRecordServiceImpl 单测：最近使用去重保序 + 截断、游客返回空。
 */
class ToolUsageRecordServiceImplTest {

    private final ToolUsageRecordServiceImpl service = Mockito.spy(new ToolUsageRecordServiceImpl());

    private ToolUsageRecord rec(long toolId) {
        ToolUsageRecord r = new ToolUsageRecord();
        r.setToolId(toolId);
        return r;
    }

    @Test
    void listRecentToolIds_dedupKeepsRecencyOrderAndLimit() {
        // 按时间倒序的记录（含重复）：11,12,11,13,12,14
        List<ToolUsageRecord> records = List.of(
                rec(11L), rec(12L), rec(11L), rec(13L), rec(12L), rec(14L));
        doReturn(records).when(service).list(any(Wrapper.class));

        List<Long> ids = service.listRecentToolIds(1L, 3);

        // 去重保序后：11,12,13（取前 3）
        assertEquals(List.of(11L, 12L, 13L), ids);
    }

    @Test
    void listRecentToolIds_guestReturnsEmpty() {
        assertTrue(service.listRecentToolIds(null, 10).isEmpty());
    }
}
