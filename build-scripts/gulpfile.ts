import { series, parallel } from 'gulp';
import { mkdir, rm } from 'fs/promises';
import { outputRoot, runTask, withTaskName } from './src';

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
	parallel(runTask('buildModules'))
);

export * from './src';
