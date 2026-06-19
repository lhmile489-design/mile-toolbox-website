package com.example.miletoolboxendproject.vo;

import lombok.Data;

import java.io.Serializable;
import java.math.BigDecimal;

/**
 * 货币汇率换算结果。
 * <p>对接接口盒子 {@code /api/jinrong/huilv.php}。
 */
@Data
public class CurrencyVO implements Serializable {

    /** 源货币代码（如 USD） */
    private String from;

    /** 目标货币代码（如 CNY） */
    private String to;

    /** 汇率（1 单位源货币 = rate 单位目标货币） */
    private BigDecimal rate;

    /** 待换算金额 */
    private BigDecimal amount;

    /** 换算结果金额 */
    private BigDecimal result;

    /** 汇率更新时间（上游 uptime，每日更新一次） */
    private String updatedAt;
}
