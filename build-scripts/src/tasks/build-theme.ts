import gulpSass from 'gulp-sass';
import dartSass from 'sass';
import autoprefixer from 'gulp-autoprefixer';
import cleanCSS from 'gulp-clean-css';
import consola from 'consola';
import chalk from 'chalk';
import { dest, src } from 'gulp';
import path from 'path';
import postcssFunctions from 'postcss-functions';
import Color from 'color';
import postcss from 'gulp-postcss';
import { getDir } from '../utils';

/**
 * 构建主题样式文件
 * 将 SCSS 文件编译为 CSS，并进行压缩和添加浏览器前缀
 */
export async function buildTheme() {
	// 创建 sass 编译器实例
	const sass = gulpSass(dartSass);

	return (
		src(path.resolve(getDir(), 'src/**/*.{scss,css}'))
			// 编译 SCSS 文件
			.pipe(sass.sync())
			// 添加浏览器前缀
			.pipe(autoprefixer({ cascade: false }) as any)
			.pipe(
				postcss([
					postcssFunctions({
						functions: {
							darken: (value: string, amount: string) => {
								try {
									const color = (Color(value) as any).darken(
										parseFloat(amount) / 100
									);
									// 对 hsl/hsla 的各个分量进行舍入
									return color.hsl().round().toString();
								} catch {
									return value;
								}
							},
							lighten: (value: string, amount: string) => {
								try {
									const color = (Color(value) as any).lighten(
										parseFloat(amount) / 100
									);
									// 对 hsl/hsla 的各个分量进行舍入
									return color.hsl().round().toString();
								} catch {
									return value;
								}
							},
						},
					}),
				])
			)
			// 压缩 CSS 文件并输出压缩信息
			.pipe(
				cleanCSS(
					{
						// 添加以下配置来合并重复的选择器
						level: {
							2: {
								mergeSemantically: true, // 合并语义相同的选择器
								restructureRules: true, // 重组规则以优化输出
							},
						},
					},
					(details) => {
						consola.success(
							`${chalk.cyan(details.name)}: ${chalk.yellow(
								details.stats.originalSize / 1000
							)} KB -> ${chalk.green(details.stats.minifiedSize / 1000)} KB`
						);
					}
				)
			)
			// 输出到 dist 目录
			.pipe(dest(`${getDir()}/dist`))
	);
}
