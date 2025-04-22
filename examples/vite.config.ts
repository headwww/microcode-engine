import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import eslintPlugin from 'vite-plugin-eslint';
import stylelitPlugin from 'vite-plugin-stylelint';

export default defineConfig({
	plugins: [vue(), vueJsx(), eslintPlugin(), stylelitPlugin()],
	css: {
		preprocessorOptions: {
			scss: {
				api: 'modern-compiler', // or "modern"
			},
		},
	},
	server: {
		host: '0.0.0.0',
		port: 9099,
		open: true, // 自动打开浏览器
		proxy: {
			'/ltApi': {
				target: 'http://ltscn.kmdns.net:9092/',
				// target: 'http://192.168.1.241:9090/',
				// target: 'http://192.168.1.153:8080/',
				// target: 'http://192.168.1.244:9094/',
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/ltApi/, ''),
			},
		},
	},
	build: {
		target: 'esnext', // 或 'es2022'
		assetsDir: 'assets',
	},
});
