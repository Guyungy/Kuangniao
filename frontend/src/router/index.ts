import { createRouter, createWebHashHistory } from 'vue-router';
import type { App } from 'vue';
import type { RouteRecordRaw } from 'vue-router';
import { useUserStore } from '@/store/modules/user-store';
import { usePermissionStore } from '@/store/modules/permission-store';

export const constantRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/',
    component: () => import('@/layouts/index.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: { title: '首页', icon: 'dashboard' }
      },
      {
        path: 'order',
        name: 'Order',
        component: () => import('@/views/order/index.vue'),
        meta: { title: '订单管理', icon: 'order' }
      },
      {
        path: 'worker',
        name: 'Worker',
        component: () => import('@/views/worker/index.vue'),
        meta: { title: '打手管理', icon: 'worker' }
      },
      {
        path: 'member',
        name: 'Member',
        component: () => import('@/views/member/index.vue'),
        meta: { title: '会员管理', icon: 'member' }
      },
      {
        path: 'recharge',
        name: 'Recharge',
        component: () => import('@/views/recharge/index.vue'),
        meta: { title: '充值管理', icon: 'recharge' }
      },
      {
        path: 'commission-rule',
        name: 'CommissionRule',
        component: () => import('@/views/commission-rule/index.vue'),
        meta: { title: '佣金规则', icon: 'commission-rule' }
      },
      {
        path: 'report',
        name: 'Report',
        component: () => import('@/views/report/index.vue'),
        meta: { title: '数据报表', icon: 'report' }
      },
      {
        path: 'worker-settlement',
        name: 'WorkerSettlement',
        component: () => import('@/views/worker-settlement/index.vue'),
        meta: { title: '打手对账', icon: 'settlement' }
      },
      {
        path: 'system',
        component: () => import('@/views/system/index.vue'),
        meta: { title: '系统管理', icon: 'system' },
        children: [
          {
            path: 'user',
            name: 'SystemUser',
            component: () => import('@/views/system/user/index.vue'),
            meta: { title: '用户管理', icon: 'user' }
          },
          {
            path: 'role',
            name: 'SystemRole',
            component: () => import('@/views/system/role/index.vue'),
            meta: { title: '角色管理', icon: 'role' }
          }
        ]
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/views/profile/index.vue'),
        meta: { title: '个人中心', icon: 'profile' }
      }
    ]
  },
  {
    path: '/redirect',
    component: () => import('@/views/redirect/index.vue'),
    meta: { title: '重定向' }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/error/404.vue'),
    meta: { title: '404' }
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes: constantRoutes
});

// 路由守卫
router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore();
  const permissionStore = usePermissionStore();

  // 设置页面标题
  document.title = to.meta.title ? `${to.meta.title} - 道道管理系统` : '道道管理系统';

  // 调试：打印路由跳转信息
  console.log('🧭 路由守卫: from -> to', { from: from.fullPath, to: to.fullPath });
  console.log('🧭 路由守卫: 登录状态', userStore.isLoggedIn());
  console.log('🧭 路由守卫: 是否已生成动态路由', permissionStore.routes.length > 0);

  // 检查是否需要登录
  if (to.path === '/login') {
    if (userStore.isLoggedIn()) {
      next('/');
    } else {
      next();
    }
    return;
  }

  // 检查是否已登录
  if (!userStore.isLoggedIn()) {
    next('/login');
    return;
  }

  // 检查是否已获取用户信息
  if (!userStore.userInfo?.userId) {
    try {
      console.log('👤 获取用户信息...');
      await userStore.getUserInfo();
      console.log('👤 用户信息已获取:', userStore.userInfo);
    } catch (error) {
      userStore.logout();
      next('/login');
      return;
    }
  }

  // 检查是否已生成路由
  if (permissionStore.routes.length === 0) {
    try {
      console.log('🧩 生成动态路由...');
      const dynamicRoutes = await permissionStore.generateRoutes();
      console.log('🧩 动态路由数量:', dynamicRoutes.length);
      console.log('🧩 静态路由数量:', constantRoutes.length);
      console.log('🧩 合并后路由数量:', permissionStore.routes.length);
      permissionStore.routes.forEach(route => {
        console.log('➕ 动态添加路由:', route.name || route.path);
        router.addRoute(route);
      });
      next({ ...to, replace: true });
      return;
    } catch (error) {
      console.error('生成路由失败:', error);
      next('/login');
      return;
    }
  }

  next();
});

export default router;

// 供插件安装时调用，统一在 plugins/index.ts 中使用
export function setupRouter(app: App<Element>) {
  app.use(router);
}
