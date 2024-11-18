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
export const copyDescriptions = async () => {
	Promise.all([
		copyFile(`${getDir()}/package.json`, `${getDir()}/dist/package.json`),
	]);
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
