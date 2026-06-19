/** 用户系统接口（对接文档 §1） */
import { get, post, put } from './http';

/** POST /user/register 注册 → UserVO */
export const register = ({ username, password, nickname }) =>
  post('/user/register', { username, password, nickname });

/** POST /user/login 登录 → { token, user } */
export const login = ({ username, password }) => post('/user/login', { username, password });

/** POST /user/logout 登出 */
export const logout = () => post('/user/logout');

/** GET /user/info 当前用户信息 → UserVO */
export const fetchUserInfo = () => get('/user/info');

/** PUT /user/info 修改资料（仅传非空字段）→ UserVO */
export const updateUserInfo = (payload) => put('/user/info', payload);

/** PUT /user/password 修改密码 */
export const changePassword = ({ oldPassword, newPassword }) =>
  put('/user/password', { oldPassword, newPassword });
