/*
 * @Author: shuwen 1243889238@qq.com
 * @Date: 2024-11-18 21:42:51
 * @LastEditors: shuwen 1243889238@qq.com
 * @LastEditTime: 2025-08-04 23:21:01
 * @FilePath: /microcode-engine/build-scripts/src/utils/paths.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
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

// 是否构建 UMD 格式
export const isBuildUmd = process.env.BUILD_UMD === 'true';
// 是否构建主题
export const isBuildTheme = process.env.BUILD_THEME === 'true';
// 是否复制主题
export const isCopyTheme = process.env.COPY_THEME === 'true';
// UMD 名称
export const umdName = process.env.UMD_NAME;

export const outputRoot = resolve(getDir(), 'dist');

export const buildRoot = resolve(projRoot, 'build-scripts');

export const epPackage = resolve(getDir(), 'package.json');
export const rootPackage = resolve(projRoot, 'package.json');
