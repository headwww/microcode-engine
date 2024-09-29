import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import eslintPlugin from 'vite-plugin-eslint';
import stylelitPlugin from 'vite-plugin-stylelint';

export default defineConfig({
	plugins: [vue(), vueJsx(), eslintPlugin(), stylelitPlugin()],
	server: {
		host: '0.0.0.0',
		port: 9099,
	},
});
