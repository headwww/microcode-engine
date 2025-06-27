/*
 * @Author: shuwen 1243889238@qq.com
 * @Date: 2025-06-27 10:23:50
 * @LastEditors: shuwen 1243889238@qq.com
 * @LastEditTime: 2025-06-27 10:26:02
 * @FilePath: /microcode-engine/examples/src/router.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { createRouter, createWebHistory } from 'vue-router';
import Work1 from './Work1.vue';
import Work2 from './Work2.vue';

// 1. 定义路由组件
// 这些组件可以从其他文件导入
// 通常我们会将每个视图（view）对应一个组件
// 比如 HomeView 和 AboutView
// 假设你已经在 src/views 目录下创建了 HomeView.vue 和 AboutView.vue

// 2. 定义路由
// 每个路由都应该映射到一个组件。
// `path` 是 URL 路径，`component` 是对应的组件
const routes = [
	{
		path: '/',
		name: 'home',
		component: Work1,
	},
	{
		path: '/work2',
		name: 'work2',
		component: Work2,
		// 也可以使用懒加载，这样组件只在需要时才加载
		// component: () => import('../views/AboutView.vue')
	},
];

// 3. 创建 router 实例
// `createWebHistory()` 使用 HTML5 History 模式
// 这样 URL 看起来更干净，没有 # 号
const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes,
});

// 4. 导出 router 实例
export default router;
