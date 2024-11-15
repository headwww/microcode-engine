import consola from 'consola';
import chalk from 'chalk';
import { spawn } from 'child_process';
import { projRoot } from './paths';

/**
 * 执行命令
 * @param command 命令
 * @param cwd 工作目录
 * @returns
 */
export const run = async (command: string, cwd: string = projRoot) =>
	new Promise<void>((resolve, reject) => {
		// 分割命令和参数 例如：pnpm run dev被分割为cmd = [pnpm] args = [run, dev]
		const [cmd, ...args] = command.split(' ');
		// 打印执行的命令信息
		consola.info(
			`${chalk.cyan('执行命令')} ${chalk.green(cmd)} ${chalk.yellow(args.join(' '))} ${chalk.gray(
				cwd ? `在 ${cwd} 目录下` : '在当前目录下'
			)}`
		);

		// 使用spawn创建子进程执行命令
		const app = spawn(cmd, args, {
			cwd, // 指定工作目录
			stdio: 'inherit', // 继承父进程的标准输入输出
			shell: process.platform === 'win32', // Windows下使用shell
		});

		// 进程退出时的处理函数
		const onProcessExit = () => app.kill('SIGHUP');

		// 监听子进程关闭事件
		app.on('close', (code) => {
			// 移除进程退出监听器
			process.removeListener('exit', onProcessExit);

			// 根据退出码判断命令是否执行成功
			if (code === 0) resolve();
			else
				reject(
					new Error(`Command failed. \n Command: ${command} \n Code: ${code}`)
				);
		});
		// 监听主进程退出事件
		process.on('exit', onProcessExit);
	});
