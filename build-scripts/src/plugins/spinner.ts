import ora from 'ora';
import chalk from 'chalk';
import path from 'path';
import type { Plugin } from 'rollup';
import { epPackage, getPackageDependencies } from '../utils';

export function progressPlugin(): Plugin {
	let processedFiles = 0;
	let totalFiles = 0;

	const spinner = ora({
		text: `正在准备打包...`,
		color: 'cyan',
		spinner: 'dots',
	}).start();

	return {
		name: 'progress',

		buildStart() {
			spinner.color = 'yellow';
			spinner.text = '开始打包...';
		},

		async transform(code, id) {
			processedFiles++;
			const relativePath = path.relative(process.cwd(), id);
			const percentage = totalFiles
				? Math.round((processedFiles / totalFiles) * 100)
				: 0;

			spinner.text = `${chalk.yellow(`${getPackageDependencies(epPackage).name} 正在打包`)} ${chalk.cyan(`[${percentage}%]`)}
${chalk.dim('当前文件:')} ${relativePath}
${chalk.dim('已处理:')} ${processedFiles}${totalFiles ? `/${totalFiles}` : ''} 个文件`;
		},

		buildEnd() {
			spinner.stopAndPersist({
				symbol: chalk.green('✔'),
				text: chalk.green(
					`${getPackageDependencies(epPackage).name} js文件打包完成！共处理 ${processedFiles} 个文件`
				),
			});
		},

		renderError(error) {
			spinner.fail(
				chalk.red(`${getPackageDependencies(epPackage).name} 打包失败！`)
			);
			// eslint-disable-next-line no-console
			console.error(chalk.red(error));
		},

		async options(inputOptions) {
			if (Array.isArray(inputOptions.input)) {
				totalFiles = inputOptions.input.length;
			}
			return null;
		},
	};
}
