package com.example.miletoolboxendproject.controller;

import cn.dev33.satoken.annotation.SaIgnore;
import com.example.miletoolboxendproject.common.Result;
import com.example.miletoolboxendproject.exception.BusinessException;
import com.example.miletoolboxendproject.exception.ErrCode;
import com.example.miletoolboxendproject.ratelimit.RateLimit;
import com.example.miletoolboxendproject.service.CurrencyService;
import com.example.miletoolboxendproject.service.GeoService;
import com.example.miletoolboxendproject.service.IpLocationService;
import com.example.miletoolboxendproject.service.PhoneLocationService;
import com.example.miletoolboxendproject.service.ToolService;
import com.example.miletoolboxendproject.service.WeatherService;
import com.example.miletoolboxendproject.service.ZipcodeService;
import com.example.miletoolboxendproject.utils.AuthUtils;
import com.example.miletoolboxendproject.vo.CurrencyVO;
import com.example.miletoolboxendproject.vo.IpLocationVO;
import com.example.miletoolboxendproject.vo.PhoneLocationVO;
import com.example.miletoolboxendproject.vo.WeatherVO;
import com.example.miletoolboxendproject.vo.ZipcodeVO;
import jakarta.annotation.Resource;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;

/**
 * 查询类工具接口（公开）。
 */
@SaIgnore
@RestController
@RequestMapping("/query")
public class QueryController {

    @Resource
    private GeoService geoService;

    @Resource
    private IpLocationService ipLocationService;

    @Resource
    private PhoneLocationService phoneLocationService;

    @Resource
    private ZipcodeService zipcodeService;

    @Resource
    private CurrencyService currencyService;

    @Resource
    private WeatherService weatherService;

    @Resource
    private ToolService toolService;

    /**
     * 邮编查询（按地区名或邮编模糊查询）。
     *
     * @param keyword 区县/城市/省份名，或邮编数字
     * @return 匹配的邮编列表
     */
    @SaIgnore
    @RateLimit
    @GetMapping("/zipcode")
    public Result<java.util.List<ZipcodeVO>> zipcode(@RequestParam String keyword) {
        java.util.List<ZipcodeVO> list = zipcodeService.query(keyword);
        toolService.reportUse("zipcode", AuthUtils.currentUserIdOrNull());
        return Result.success(list);
    }

    /**
     * 手机号归属地查询。
     *
     * @param phone 11 位手机号
     * @return 归属地（省/市/运营商/区号/邮编）
     */
    @SaIgnore
    @RateLimit
    @GetMapping("/phone-location")
    public Result<PhoneLocationVO> phoneLocation(@RequestParam String phone) {
        PhoneLocationVO vo = phoneLocationService.query(phone);
        toolService.reportUse("phone-location", AuthUtils.currentUserIdOrNull());
        return Result.success(vo);
    }

    /**
     * IP 归属地查询。
     *
     * @param ip      IPv4 地址；不传则取请求来源 IP
     * @param request 用于在 ip 缺省时取来源 IP
     * @return 归属地（国家/省/市/ISP）
     */
    @SaIgnore
    @RateLimit
    @GetMapping("/ip-location")
    public Result<IpLocationVO> ipLocation(@RequestParam(required = false) String ip,
                                           HttpServletRequest request) {
        String target = (ip != null && !ip.isBlank()) ? ip.trim() : clientIp(request);
        IpLocationVO vo = ipLocationService.query(target);
        toolService.reportUse("ip-location", AuthUtils.currentUserIdOrNull());
        return Result.success(vo);
    }

    /** 取客户端真实 IP（兼容反向代理） */
    private String clientIp(HttpServletRequest request) {
        String xff = request.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) {
            int comma = xff.indexOf(',');
            return comma > 0 ? xff.substring(0, comma).trim() : xff.trim();
        }
        String real = request.getHeader("X-Real-IP");
        if (real != null && !real.isBlank()) {
            return real.trim();
        }
        return request.getRemoteAddr();
    }

    /**
     * 地理编码（维智）。
     * <p>正向：传 {@code address}（可选 {@code city}）→ 返回坐标候选列表；
     * <p>逆向：传 {@code lng} + {@code lat}（可选 {@code spatialReference}，默认 gcj02）→ 返回结构化地址。
     *
     * @param address          地址/关键词（正向）
     * @param city             城市（正向，可选）
     * @param lng              经度（逆向）
     * @param lat              纬度（逆向）
     * @param spatialReference 坐标系（逆向，可选）
     */
    @SaIgnore
    @RateLimit
    @GetMapping("/geocode")
    public Result<Object> geocode(@RequestParam(required = false) String address,
                                  @RequestParam(required = false) String city,
                                  @RequestParam(required = false) Double lng,
                                  @RequestParam(required = false) Double lat,
                                  @RequestParam(required = false) String spatialReference) {
        Object data;
        if (address != null && !address.isBlank()) {
            data = geoService.forward(address, city);
        } else if (lng != null && lat != null) {
            data = geoService.reverse(lng, lat, spatialReference);
        } else {
            throw new BusinessException(ErrCode.PARAM_ERROR, "正向需传 address，逆向需传 lng 与 lat");
        }
        toolService.reportUse("geocode", AuthUtils.currentUserIdOrNull());
        return Result.success(data);
    }

    /**
     * 货币汇率换算（接口盒子）。
     *
     * @param from   源货币代码（如 USD）
     * @param to     目标货币代码（如 CNY）
     * @param amount 待换算金额，默认 1
     * @return 换算结果（from/to/rate/amount/result/updatedAt）
     */
    @SaIgnore
    @RateLimit
    @GetMapping("/currency")
    public Result<CurrencyVO> currency(@RequestParam String from,
                                       @RequestParam String to,
                                       @RequestParam(required = false, defaultValue = "1") BigDecimal amount) {
        CurrencyVO vo = currencyService.convert(from, to, amount);
        toolService.reportUse("currency", AuthUtils.currentUserIdOrNull());
        return Result.success(vo);
    }

    /**
     * 天气查询（uapis.cn）。
     *
     * @param city 城市名（中/英文）；不传时按客户端 IP 自动定位
     * @return 实时天气 + 多天预报
     */
    @SaIgnore
    @RateLimit
    @GetMapping("/weather")
    public Result<WeatherVO> weather(@RequestParam(required = false) String city) {
        WeatherVO vo = weatherService.query(city);
        toolService.reportUse("weather", AuthUtils.currentUserIdOrNull());
        return Result.success(vo);
    }
}
