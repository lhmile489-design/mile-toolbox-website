package com.example.miletoolboxendproject.service;

import com.example.miletoolboxendproject.vo.IpLocationVO;

/**
 * IP 归属地查询服务（ip2region 离线库）。
 */
public interface IpLocationService {

    /**
     * 查询 IP 归属地
     *
     * @param ip IPv4 地址
     * @return 归属地信息
     */
    IpLocationVO query(String ip);
}
