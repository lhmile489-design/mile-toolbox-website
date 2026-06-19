package com.example.miletoolboxendproject;

import com.example.miletoolboxendproject.exception.BusinessException;
import com.example.miletoolboxendproject.service.impl.ToolFavoriteServiceImpl;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.verify;

/**
 * ToolFavoriteServiceImpl 核心不变量单测（Mockito spy）。
 * 覆盖：重复收藏拦截、未收藏取消拦截、游客（userId 为空）返回空。
 */
class ToolFavoriteServiceImplTest {

    private final ToolFavoriteServiceImpl service = Mockito.spy(new ToolFavoriteServiceImpl());

    @Test
    void favorite_duplicate_throws() {
        doReturn(1L).when(service).count(any());
        BusinessException e = assertThrows(BusinessException.class, () -> service.favorite(1L, 11L));
        assertEquals("10202", e.getCode());
    }

    @Test
    void favorite_success_saves() {
        doReturn(0L).when(service).count(any());
        doReturn(true).when(service).save(any());
        service.favorite(1L, 11L);
        verify(service).save(any());
    }

    @Test
    void unfavorite_notExists_throws() {
        doReturn(0L).when(service).count(any());
        BusinessException e = assertThrows(BusinessException.class, () -> service.unfavorite(1L, 11L));
        assertEquals("10203", e.getCode());
    }

    @Test
    void listFavoriteToolIds_nullUser_returnsEmpty() {
        List<Long> ids = service.listFavoriteToolIds(null);
        assertTrue(ids.isEmpty());
    }
}
