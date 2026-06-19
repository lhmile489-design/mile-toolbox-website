import type { Member, OrderRow } from '@/api/types'

/** 生成示例成员数据 */
function genMembers(): Member[] {
  const roles: Member['role'][] = ['admin', 'editor', 'viewer']
  const names = [
    '张伟', '王芳', '李娜', '刘洋', '陈静', '杨帆', '赵磊', '黄敏',
    '周杰', '吴婷', '徐强', '孙丽', '马超', '朱琳', '胡军', '郭敏',
    '林峰', '何静', '高翔', '罗丹', '宋涛', '唐悦', '韩雪', '冯刚',
  ]
  return names.map((name, i) => ({
    id: i + 1,
    name,
    email: `user${i + 1}@example.com`,
    role: roles[i % roles.length] as Member['role'],
    status: (i % 5 === 0 ? 1 : 0) as 0 | 1,
    createTime: `2026-0${(i % 6) + 1}-${String((i % 27) + 1).padStart(2, '0')} 10:${String(i % 60).padStart(2, '0')}:00`,
  }))
}

/** 生成示例订单数据 */
function genOrders(): OrderRow[] {
  const statuses: OrderRow['status'][] = ['pending', 'paid', 'shipped', 'done', 'canceled']
  const customers = ['Acme Inc', 'Globex', 'Initech', 'Umbrella', 'Stark', 'Wayne', 'Wonka', 'Hooli']
  const rows: OrderRow[] = []
  for (let i = 1; i <= 57; i++) {
    rows.push({
      id: i,
      orderNo: `ORD-2026-${String(1000 + i)}`,
      customer: customers[i % customers.length] as string,
      amount: Math.round((Math.random() * 9000 + 100) * 100) / 100,
      status: statuses[i % statuses.length] as OrderRow['status'],
      createTime: `2026-06-${String((i % 28) + 1).padStart(2, '0')} ${String(i % 24).padStart(2, '0')}:30:00`,
    })
  }
  return rows
}

/** 内存数据库（mock 状态） */
export const db = {
  members: genMembers(),
  orders: genOrders(),
  memberSeq: 25,
}
