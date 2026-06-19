package com.example.miletoolboxendproject.service;

import com.example.miletoolboxendproject.vo.CurrencyVO;

import java.math.BigDecimal;

/**
 * 货币汇率换算服务（接口盒子 apihz.cn）。
 */
public interface CurrencyService {

    /**
     * 货币汇率换算
     *
     * @param from   源货币代码（如 USD）
     * @param to     目标货币代码（如 CNY）
     * @param amount 待换算金额
     * @return 换算结果（含汇率与更新时间）
     */
    CurrencyVO convert(String from, String to, BigDecimal amount);
}
