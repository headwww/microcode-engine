/*
 * @Author: shuwen 1243889238@qq.com
 * @Date: 2024-11-16 22:35:56
 * @LastEditors: shuwen 1243889238@qq.com
 * @LastEditTime: 2024-11-16 23:11:21
 * @FilePath: /microcode-engine/build-scripts/src/tasks/build-umd.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { rollup } from 'rollup';
import esbuild from 'rollup-plugin-esbuild';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import { outputRoot, getDir, isBuildUmd } from '../utils';
import { progressPlugin } from '../plugins/spinner';

/**
 * 构建 UMD 格式
 */
export const buildUmd = async () => {
	if (isBuildUmd) {
		const umdBundle = await rollup({
			input: `${getDir()}/src/index.ts`, // 指定入口文件
			plugins: [
				progressPlugin(),
				vue({
					include: [/\.vue$/, /\.md$/],
				}) as unknown as Plugin,
				vueJsx() as unknown as Plugin,
				nodeResolve({
					extensions: ['.mjs', '.js', '.json', '.ts', '.tsx', '.jsx'],
				}),
				commonjs(),
				json(),
				esbuild({
					sourceMap: true,
					target: 'esnext',
					loaders: {
						'.tsx': 'tsx',
					},
				}),
			],
			external: [
				'vue',
				'ant-design-vue',
				'@ant-design/icons-vue',
				'lodash-es',
				'lodash',
			],
		});

		// 输出 UMD
		await umdBundle.write({
			file: `${outputRoot}/dist/index.js`,
			format: 'umd',
			name: 'ArvinMicrocodeEngine',
			sourcemap: true,
			// TODO 项目写完之后考虑哪些依赖需要配置
			globals: {
				vue: 'Vue',
				'ant-design-vue': 'antd',
				'@ant-design/icons-vue': 'iconsVue',
				lodash: '_',
				'lodash-es': '_',
			},
		});

		await umdBundle.close();
	}
};
