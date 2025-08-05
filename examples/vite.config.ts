/*
 * @Author: shuwen 1243889238@qq.com
 * @Date: 2025-04-17 18:39:54
 * @LastEditors: shuwen 1243889238@qq.com
 * @LastEditTime: 2025-06-25 09:25:00
 * @FilePath: /microcode-engine/examples/vite.config.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import eslintPlugin from 'vite-plugin-eslint';
import stylelitPlugin from 'vite-plugin-stylelint';

export default defineConfig({
	plugins: [
		vue(),
		vueJsx(),
		eslintPlugin({
			exclude: ['node_modules', 'dist', '**/dist/**'], // 明确排除打包目录
		}),
		stylelitPlugin(),
	],
	css: {
		preprocessorOptions: {
			scss: {
				api: 'modern-compiler', // or "modern"
			},
		},
	},
	server: {
		host: '0.0.0.0',
		port: 9098,
		open: true, // 自动打开浏览器
		proxy: {
			'/api': {
				// target: 'http://ltscn.kmdns.net:9094/',
				target: 'http://ltscn.kmdns.net:9095/',
				// target: 'http://ltscn.kmdns.net:9092/',
				// target: 'http://192.168.1.241:9090/',
				// target: 'http://192.168.1.153:8080/',
				// target: 'http://192.168.1.244:9094/',
				changeOrigin: true,
				// rewrite: (path) => path.replace(/^\/ltApi/, ''),
			},
		},
	},
	build: {
		target: 'esnext', // 或 'es2022'
		assetsDir: 'assets',
	},
});
