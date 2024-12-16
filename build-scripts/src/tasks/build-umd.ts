import { rollup } from 'rollup';
import esbuild from 'rollup-plugin-esbuild';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import replace from '@rollup/plugin-replace';
import { outputRoot, getDir, isBuildUmd, umdName } from '../utils';
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
				replace({
					preventAssignment: true,
					values: {
						// 处理vue-router的umd文件的报错
						__VUE_PROD_DEVTOOLS__: JSON.stringify('false'),
						'process.env.NODE_ENV': JSON.stringify('production'),
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
			file: `${outputRoot}/dist/js/index.js`,
			format: 'umd',
			name: umdName,
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
