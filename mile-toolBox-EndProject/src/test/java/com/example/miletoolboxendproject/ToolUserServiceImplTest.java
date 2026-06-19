package com.example.miletoolboxendproject;

import com.example.miletoolboxendproject.domain.ToolUser;
import com.example.miletoolboxendproject.dto.LoginDTO;
import com.example.miletoolboxendproject.dto.RegisterDTO;
import com.example.miletoolboxendproject.exception.BusinessException;
import com.example.miletoolboxendproject.service.impl.ToolUserServiceImpl;
import com.example.miletoolboxendproject.vo.UserVO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * ToolUserServiceImpl 核心不变量单测（Mockito spy，不依赖 DB / Sa-Token）。
 * 覆盖：用户名唯一、注册 BCrypt、登录密码校验、账号禁用。
 */
class ToolUserServiceImplTest {

    private ToolUserServiceImpl service;
    private PasswordEncoder encoder;

    @BeforeEach
    void setUp() {
        service = Mockito.spy(new ToolUserServiceImpl());
        encoder = Mockito.mock(PasswordEncoder.class);
        ReflectionTestUtils.setField(service, "passwordEncoder", encoder);
    }

    @Test
    void register_duplicateUsername_throws() {
        doReturn(1L).when(service).count(any());
        RegisterDTO dto = new RegisterDTO();
        dto.setUsername("alice");
        dto.setPassword("123456");
        BusinessException e = assertThrows(BusinessException.class, () -> service.register(dto));
        assertEquals("10100", e.getCode());
    }

    @Test
    void register_success_encodesPasswordWithBCrypt() {
        doReturn(0L).when(service).count(any());
        doReturn(true).when(service).save(any());
        when(encoder.encode("123456")).thenReturn("$2a$hashed");
        RegisterDTO dto = new RegisterDTO();
        dto.setUsername("alice");
        dto.setPassword("123456");

        UserVO vo = service.register(dto);

        assertEquals("alice", vo.getUsername());
        verify(encoder).encode("123456");   // 必须 BCrypt 加密，不存明文
    }

    @Test
    void login_userNotFound_throwsPasswordError() {
        doReturn(null).when(service).getOne(any());
        LoginDTO dto = new LoginDTO();
        dto.setUsername("ghost");
        dto.setPassword("123456");
        BusinessException e = assertThrows(BusinessException.class, () -> service.login(dto));
        assertEquals("10102", e.getCode());   // 不泄露存在性，统一密码错误
    }

    @Test
    void login_wrongPassword_throwsPasswordError() {
        ToolUser user = new ToolUser();
        user.setId(1L);
        user.setUsername("alice");
        user.setPassword("$2a$hashed");
        user.setStatus(0);
        doReturn(user).when(service).getOne(any());
        when(encoder.matches(anyString(), anyString())).thenReturn(false);
        LoginDTO dto = new LoginDTO();
        dto.setUsername("alice");
        dto.setPassword("wrong");
        BusinessException e = assertThrows(BusinessException.class, () -> service.login(dto));
        assertEquals("10102", e.getCode());
    }

    @Test
    void login_disabledUser_throws() {
        ToolUser user = new ToolUser();
        user.setId(1L);
        user.setUsername("alice");
        user.setPassword("$2a$hashed");
        user.setStatus(1);   // 已禁用
        doReturn(user).when(service).getOne(any());
        when(encoder.matches(anyString(), anyString())).thenReturn(true);
        LoginDTO dto = new LoginDTO();
        dto.setUsername("alice");
        dto.setPassword("123456");
        BusinessException e = assertThrows(BusinessException.class, () -> service.login(dto));
        assertEquals("10103", e.getCode());
    }
}
