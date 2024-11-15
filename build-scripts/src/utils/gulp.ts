import { TaskFunction } from 'gulp';
import { run } from './process';
import { buildRoot } from './paths';

/**
 * 为任务函数添加显示名称
 *
 * @param name 任务名称
 * @param fn 任务函数
 * @returns 任务函数
 */
export const withTaskName: any = <T extends TaskFunction>(
	name: string,
	fn: T
) => Object.assign(fn, { displayName: name });

/**
 * 运行 shell 任务
 * @param name 任务名称
 * @returns 任务函数
 */
export const runTask = (name: string) =>
	withTaskName(`shellTask:${name}`, () =>
		run(`pnpm run start ${name}`, buildRoot)
	);
