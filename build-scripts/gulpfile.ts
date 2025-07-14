import { series, parallel } from 'gulp';
import { mkdir, rm, copyFile } from 'fs/promises';
import {
	getDir,
	isBuildTheme,
	isBuildUmd,
	isCopyTheme,
	outputRoot,
	projRoot,
	runTask,
	withTaskName,
} from './src';
import { readFile, writeFile } from 'fs/promises';

/**
 * 复制主题
 */
export const copyTheme = async () => {
	await Promise.all([
		mkdir(`${getDir()}/dist/dist/css`, { recursive: true }).then(() =>
			copyFile(
				`${projRoot}/packages/theme/dist/index.css`,
				`${getDir()}/dist/dist/css/index.css`
			)
		),
	]);
};

/**
 * 复制描述文件
 */
// export const copyDescriptions = async () => {
// 	Promise.all([
// 		copyFile(`${getDir()}/package.json`, `${getDir()}/dist/package.json`),
// 	]);
// };

export const copyDescriptions = async () => {
	const src = `${getDir()}/package.json`;
	const dest = `${getDir()}/dist/package.json`;

	const pkgStr = await readFile(src, 'utf-8');
	const pkg = JSON.parse(pkgStr);

	if (!process.env.BUILD_THEME) {
		// 修改 main 和 module 字段
		pkg.main = 'lib/index.js';
		pkg.module = 'es/index.js';
	}

	await writeFile(dest, JSON.stringify(pkg, null, 2), 'utf-8');
};

export default series(
	withTaskName('初始化', async () => {
		try {
			await rm(outputRoot, { recursive: true, force: true });
		} catch (error) {
			if (error.code !== 'ENOENT') {
				throw error;
			}
		}
	}),

	withTaskName('创建输出目录', () => mkdir(outputRoot, { recursive: true })),
	!isBuildTheme
		? parallel(
				runTask('buildModules'),
				// 构建 UMD 格式
				isBuildUmd ? runTask('buildUmd') : [],
				runTask('buildDts')
			)
		: parallel(runTask('buildTheme')),
	withTaskName('清理额外的产物', () =>
		rm(`${projRoot}/dist`, { recursive: true, force: true })
	),
	parallel(isCopyTheme ? runTask('copyTheme') : [], runTask('copyDescriptions'))
);

export * from './src';
