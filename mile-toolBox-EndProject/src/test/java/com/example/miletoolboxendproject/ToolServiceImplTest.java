package com.example.miletoolboxendproject;

import com.baomidou.mybatisplus.core.conditions.Wrapper;
import com.example.miletoolboxendproject.domain.Tool;
import com.example.miletoolboxendproject.exception.BusinessException;
import com.example.miletoolboxendproject.service.ToolFavoriteService;
import com.example.miletoolboxendproject.service.ToolUsageRecordService;
import com.example.miletoolboxendproject.service.impl.ToolServiceImpl;
import com.example.miletoolboxendproject.vo.ToolVO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * ToolServiceImpl 核心不变量单测（Mockito spy）。
 * 覆盖：上报使用原子自增+记录、工具不存在、清单批量标记 favorited（防 N+1）。
 */
class ToolServiceImplTest {

    private ToolServiceImpl service;
    private ToolFavoriteService favoriteService;
    private ToolUsageRecordService usageRecordService;

    @BeforeEach
    void setUp() {
        service = Mockito.spy(new ToolServiceImpl());
        favoriteService = mock(ToolFavoriteService.class);
        usageRecordService = mock(ToolUsageRecordService.class);
        ReflectionTestUtils.setField(service, "favoriteService", favoriteService);
        ReflectionTestUtils.setField(service, "usageRecordService", usageRecordService);
    }

    private Tool tool(long id, String key) {
        Tool t = new Tool();
        t.setId(id);
        t.setToolKey(key);
        t.setName(key);
        t.setStatus(0);
        t.setUseCount(0L);
        return t;
    }

    @Test
    void reportUse_incrementsUseCountAndRecords() {
        Tool t = tool(11L, "pdf-merge");
        doReturn(t).when(service).getOne(any());
        doReturn(true).when(service).update(any(Wrapper.class));

        service.reportUse("pdf-merge", 5L);

        verify(service).update(any(Wrapper.class));                              // 原子自增 useCount
        verify(usageRecordService).addRecord(eq(5L), eq(11L), eq("pdf-merge"));  // 记录使用
    }

    @Test
    void reportUse_toolNotFound_throws() {
        doReturn(null).when(service).getOne(any());
        BusinessException e = assertThrows(BusinessException.class, () -> service.reportUse("ghost", null));
        assertEquals("10200", e.getCode());
    }

    @Test
    void listTools_marksFavoritedInBatch() {
        List<Tool> tools = List.of(tool(11L, "pdf-merge"), tool(12L, "hash"), tool(13L, "uuid"));
        doReturn(tools).when(service).list(any(Wrapper.class));
        when(favoriteService.listFavoriteToolIds(7L)).thenReturn(List.of(12L));   // 仅收藏了 12

        List<ToolVO> vos = service.listTools(null, null, 7L);

        assertEquals(3, vos.size());
        assertFalse(vos.get(0).getFavorited());   // 11 未收藏
        assertTrue(vos.get(1).getFavorited());     // 12 已收藏
        assertFalse(vos.get(2).getFavorited());    // 13 未收藏
        // 防 N+1：收藏 ID 只批量查一次
        verify(favoriteService).listFavoriteToolIds(7L);
    }

    @Test
    void hotToolsByUsers_preservesRankOrderAndFiltersOffline() {
        // 排名：13 > 11 > 12（按去重人数倒序，由 usageRecordService 返回该顺序）
        when(usageRecordService.rankToolIdsByDistinctUser(10)).thenReturn(List.of(13L, 11L, 12L));
        Tool offline = tool(12L, "hash");
        offline.setStatus(1); // 已下架，应被过滤
        // listByIds 返回顺序故意打乱，验证按 rankedIds 重排
        doReturn(List.of(tool(11L, "pdf-merge"), offline, tool(13L, "uuid")))
                .when(service).listByIds(any());
        when(favoriteService.listFavoriteToolIds(7L)).thenReturn(List.of(13L));

        List<ToolVO> vos = service.hotToolsByUsers(10, 7L);

        assertEquals(2, vos.size());                       // 下架的 12 被过滤
        assertEquals(13L, vos.get(0).getId());             // 保持排名顺序：13 在前
        assertEquals(11L, vos.get(1).getId());
        assertTrue(vos.get(0).getFavorited());             // 13 已收藏
        assertFalse(vos.get(1).getFavorited());
    }

    @Test
    void hotToolsByUsers_emptyRanking_returnsEmpty() {
        when(usageRecordService.rankToolIdsByDistinctUser(10)).thenReturn(List.of());
        List<ToolVO> vos = service.hotToolsByUsers(10, null);
        assertTrue(vos.isEmpty());
    }
}
