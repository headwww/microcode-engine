import { resolve } from 'path';

export const projRoot = resolve(__dirname, '..', '..', '..');

/** 当前环境的路径 */
export const getDir = () => {
	const originalCwd = process.env.ORIGINAL_CWD;
	if (!originalCwd) {
		throw new Error(
			'ORIGINAL_CWD 环境变量未设置，请确保在执行构建任务时设置了该环境变量 cross-env ORIGINAL_CWD=$PWD'
		);
	}
	return resolve(originalCwd);
};

export const outputRoot = resolve(getDir(), 'dist');

export const buildRoot = resolve(projRoot, 'build-scripts');

export const epPackage = resolve(getDir(), 'package.json');
export const rootPackage = resolve(projRoot, 'package.json');
