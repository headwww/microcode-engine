import type { CompilerOptions, SourceFile } from 'ts-morph';
import { Project } from 'ts-morph';
import path from 'path';
import glob from 'fast-glob';
import consola from 'consola';
import { mkdir, writeFile } from 'fs/promises';
import chalk from 'chalk';
import { getDir, projRoot } from '../utils';

const tsConfigFilePath = path.resolve(getDir(), 'tsconfig.json');

export const buildDts = async () => {
	// TypeScript 编译器选项
	const compilerOptions: CompilerOptions = {
		// 启用复合项目
		composite: true,
		// 生成声明文件
		declaration: true,
		// 只生成声明文件
		emitDeclarationOnly: true,
		// 指定根目录
		rootDir: `${getDir()}/src`,
		// 直接输出到 es 目录
		outDir: path.resolve(getDir(), 'dist/es'),
		// 解析 json 模块
		resolveJsonModule: true,
		// 启用 es 模块互操作
		esModuleInterop: true,
	};

	// 创建一个新的 TypeScript 项目实例
	const project = new Project({
		// 编译器选项配置
		compilerOptions,
		// tsconfig 文件路径
		tsConfigFilePath,
		// 跳过从 tsconfig 文件中添加文件 files和include
		skipAddingFilesFromTsConfig: true,
	});

	const sourceFiles = await addSourceFiles(project);

	consola.success('++++++++已成功添加所有源文件到项目中');
	typeCheck(project);
	consola.success('✔✔✔✔✔✔✔✔类型检查通过！！！');

	await project.emit({
		emitOnlyDtsFiles: true,
	});

	// 生成声明文件
	const tasks = sourceFiles.map(async (sourceFile) => {
		// 获取源文件相对于项目根目录的路径
		const relativePath = path.relative(
			`${getDir()}/src`,
			sourceFile.getFilePath()
		);

		consola.trace(
			chalk.yellow(
				`Generating definition for file: ${chalk.bold(relativePath)}`
			)
		);

		// 获取源文件的输出文件
		const emitOutput = sourceFile.getEmitOutput();
		// 获取输出文件
		const emitFiles = emitOutput.getOutputFiles();
		// 如果输出文件为空，则抛出错误
		if (emitFiles.length === 0) {
			throw new Error(
				`${tsConfigFilePath} Emit no file: ${chalk.bold(relativePath)}`
			);
		}

		// 生成 es 和 lib 文件
		const subTasks = emitFiles.map(async (outputFile) => {
			// 只需要复制到 lib 目录即可
			const fileName = `${path.basename(relativePath, path.extname(relativePath))}.d.ts`;

			const dirPath = path.dirname(relativePath);

			const libDir = path.join(getDir(), 'dist/lib', dirPath);
			await mkdir(libDir, { recursive: true });

			const newLibFilepath = path.join(libDir, fileName);
			await writeFile(newLibFilepath, outputFile.getText(), 'utf8');

			consola.success(
				chalk.green(
					`Definition for file: ${chalk.bold(relativePath)} generated`
				)
			);
		});

		await Promise.all(subTasks);
	});

	await Promise.all(tasks);
};

/**
 * 添加源文件
 * @param project
 * @returns
 */
async function addSourceFiles(project: Project) {
	project.addSourceFileAtPath(path.resolve(projRoot, 'typings/env.d.ts'));
	const globSourceFile = '**/*.{js?(x),ts?(x),vue}';
	const filePaths = await glob(globSourceFile, {
		cwd: `${getDir()}/src`,
		ignore: ['node_modules', 'dist', '**/*.scss', '**/*.json'],
		absolute: true,
	});

	const jsonFiles = await glob('**/*.json', {
		cwd: `${getDir()}/src`,
		ignore: ['node_modules', 'dist'],
		absolute: true,
	});

	const sourceFiles: SourceFile[] = [];
	await Promise.all(
		filePaths.map(async (file) => {
			const sourceFile = project.addSourceFileAtPath(file);
			sourceFiles.push(sourceFile);
		})
	);

	// 处理 JSON 文件
	jsonFiles.forEach((file) => {
		project.addSourceFileAtPath(file);
	});

	return sourceFiles;
}

/**
 * 类型检查
 * @param project
 */
function typeCheck(project: Project) {
	// 获取项目中的所有诊断信息(类型错误、语法错误等)
	const diagnostics = project.getPreEmitDiagnostics();
	if (diagnostics.length > 0) {
		consola.error(project.formatDiagnosticsWithColorAndContext(diagnostics));
		const err = new Error('Failed to generate dts.');
		consola.error(err);
		throw err;
	}
}
