import { isJSExpression, isJSFunction } from '@arvin-shu/microcode-utils';
import { isNaN, isObject, isString } from 'lodash';

/**
 * 根据缩进级别生成缩进字符串
 * @param indent 缩进级别
 * @returns 缩进字符串
 */
function getIndentStr(indent: number) {
	let indentStr = '';
	while (indent--) {
		indentStr += ' ';
	}
	return indentStr;
}

/**
 * 根据值类型猜测变量类型
 * @param val 未知类型的值
 * @returns 变量类型字符串
 */
function guessValueType(val: unknown) {
	if (isString(val)) {
		return 'String';
	}
	if (Array.isArray(val)) {
		return 'Array';
	}
	if (isObject(val)) {
		return 'Object';
	}
	return 'null';
}

/**
 * 根据字符串值猜测变量类型
 * @param val 字符串值
 * @returns 变量类型字符串
 */
function guessStrValueType(val: string) {
	if (val === 'true' || val === 'false') {
		return 'Boolean';
	}
	if (!isNaN(Number(val))) {
		return 'Number';
	}
	if (val[0] === '/' && val[val.length - 1] === '/') {
		return 'RegExp';
	}
	try {
		return guessValueType(JSON.parse(val));
	} catch {
		return 'String';
	}
}

/**
 * 将schema转换为代码字符串
 * @param schema 模式对象
 * @param indent 缩进级别
 * @returns 代码字符串
 */
export function parseSchemaToCode(
	schema: Record<string, unknown>,
	indent: number
): string {
	const indentStr = [getIndentStr(indent)];
	const code: string[] = [];
	for (const name in schema) {
		const schemaItem = schema[name];
		if (isJSExpression(schemaItem)) {
			code.push(`${indentStr[0]}${name}: ${schemaItem.value},`);
		} else if (isJSFunction(schemaItem)) {
			code.push(
				`${indentStr[0]}${schemaItem.value
					.replace(/^function\s*/, '')
					.replace(/\n\s*/g, `$&${indentStr[0]}`)},`
			);
		} else {
			const type = isString(schemaItem)
				? guessStrValueType(schemaItem)
				: guessValueType(schemaItem);
			code.push(
				`${indentStr[0]}${name}: ${
					type === 'String' ? JSON.stringify(schemaItem) : schemaItem
				},`
			);
		}
	}
	return code.join('\n');
}

/**
 * 将schema转换为代码字符串
 * @param schema 属性对象
 * @param indent 缩进级别
 * @returns 代码字符串
 */
export function parsePropsToCode(
	schema: Record<string, unknown>,
	indent: number
): string {
	const indentStr = [getIndentStr(indent)];
	const code: string[] = [];

	for (const name in schema) {
		const schemaItem = schema[name];
		if (isJSExpression(schemaItem)) {
			code.push(`${indentStr[0]}${name}: {`);
			indentStr.unshift(`${indentStr[0]}  `);
			code.push(`${indentStr[0]}type: ${guessValueType(schemaItem.value)},`);
			code.push(`${indentStr[0]}default: ${schemaItem.value},`);
			indentStr.shift();
			code.push(`${indentStr[0]}},`);
		} else if (isJSFunction(schemaItem)) {
			code.push(`${indentStr[0]}${name}: {`);
			indentStr.unshift(`${indentStr[0]}  `);
			code.push(`${indentStr[0]}type: Function,`);
			code.push(
				`${indentStr[0]}default${schemaItem.value
					.replace(/^function[^(]*/, '')
					.replace(/\n\s*/g, `$&${indentStr[0]}`)},`
			);
			indentStr.shift();
			code.push(`${indentStr[0]}},`);
		} else if (schemaItem != null && schemaItem !== '') {
			const type = isString(schemaItem)
				? guessStrValueType(schemaItem)
				: guessValueType(schemaItem);
			code.push(`${indentStr[0]}${name}: {`);
			indentStr.unshift(`${indentStr[0]}  `);
			code.push(`${indentStr[0]}type: ${type},`);
			code.push(`${indentStr[0]}default: ${schemaItem}`);
			indentStr.shift();
			code.push(`${indentStr[0]}},`);
		} else {
			code.push(`${indentStr[0]}${name}: {},`);
		}
	}
	return code.join('\n');
}
