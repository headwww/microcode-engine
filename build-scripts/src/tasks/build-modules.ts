import glob from 'fast-glob';
import { rollup } from 'rollup';
import esbuild from 'rollup-plugin-esbuild';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import { outputRoot, getDir, generateExternal } from '../utils';

export const buildModules = async () => {
	const input = await glob('**/*.{js,ts,vue,tsx,jsx}', {
		cwd: getDir(),
		absolute: true,
		onlyFiles: true,
		ignore: ['**/*.d.ts', '**/node_modules/**'],
	});
	const bundle = await rollup({
		input,
		plugins: [
			nodeResolve({
				extensions: ['.mjs', '.js', '.json', '.ts'],
			}),
			commonjs(),
			json(),
			esbuild({
				sourceMap: true,
				target: 'esnext',
			}),
		],
		external: await generateExternal({ full: false }),
	});

	// 输出 ESM 格式到 es 目录
	await bundle.write({
		dir: `${outputRoot}/es`,
		format: 'esm',
		preserveModules: true,
		preserveModulesRoot: `${getDir()}/src`,
	});

	// 输出 CommonJS 格式到 lib 目录
	await bundle.write({
		dir: `${outputRoot}/lib`,
		format: 'cjs',
		preserveModules: true,
		preserveModulesRoot: `${getDir()}/src`,
		sourcemap: true,
	});

	await bundle.close();
};
