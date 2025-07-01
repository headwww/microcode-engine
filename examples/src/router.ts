import { createRouter, createWebHistory } from 'vue-router';
import Work1 from './Work1.vue';
import Work2 from './Work2.vue';

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
	},
];

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes,
});

export default router;
