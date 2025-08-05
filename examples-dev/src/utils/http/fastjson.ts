import { isObject } from 'xe-utils';
import { isNull } from 'lodash-es';

export type Recordable<T = any> = Record<string, T>;

export function parse(root: any): any {
	if (!isObject(root)) {
		return root;
	}

	const newRoot: any = Array.isArray(root) ? [] : {};

	Object.keys(root).forEach((key) => {
		process(null, root, key, newRoot);
	});

	function process(
		parent: Recordable | null,
		current: Recordable,
		fieldName: string,
		newCurrent: Recordable
	) {
		const fieldValue: Recordable = current[fieldName];

		// 添加对null的检查
		if (fieldValue === null) {
			newCurrent[fieldName] = null;
			return;
		}

		if (!isObject(fieldValue)) {
			newCurrent[fieldName] = fieldValue;
		} else if (fieldValue.$ref) {
			const value = fieldValue.$ref;
			let refValue: any;
			if (value === '$') {
				// root
				refValue = root;
			} else if (value === '@') {
				// 本身
				refValue = current;
			} else if (value === '..') {
				// 父亲
				refValue = parent;
			} else {
				// refValue = resolveRef(value); 改用下面更简便的方法
				const paths = (value as string).split(/[.[\]]+/).filter(Boolean);
				paths.shift(); // 从数组中移除第一个元素：$
				refValue = paths.reduce((value, key) => value[key], newRoot);
			}
			newCurrent[fieldName] = refValue;
		} else {
			const newFieldValue = Array.isArray(fieldValue) ? [] : {};
			newCurrent[fieldName] = newFieldValue;
			Object.keys(fieldValue).forEach((key) => {
				process(current, fieldValue, key, newFieldValue);
			});
		}
	}
	return newRoot;
}

/**
 * 将json对象转换为fastjson格式，生成$ref
 * @param root
 */
export function serialize(root: any): any {
	if (!isObject(root)) {
		return root;
	}

	const map: Map<any, String> = new Map();
	map.set(root, '$');

	const newRoot = Array.isArray(root) ? [] : {};

	Object.keys(root).forEach((key) => {
		process(null, root, '$', key, newRoot);
	});

	function process(
		parent: any,
		current: Recordable,
		basePath: string,
		fieldName: string | number,
		newCurrent: Recordable
	): any {
		const fieldValue = current[fieldName];
		if (!isObject(fieldValue)) {
			newCurrent[fieldName] = fieldValue;
		} else if (fieldValue === current) {
			newCurrent[fieldName] = { $ref: '@' };
		} else if (fieldValue === parent) {
			newCurrent[fieldName] = { $ref: '..' };
		} else if (map.has(fieldValue)) {
			newCurrent[fieldName] = { $ref: map.get(fieldValue) };
		} else if (isNull(fieldValue)) {
			newCurrent[fieldName] = null;
		} else {
			const endPath = Array.isArray(current)
				? `[${fieldName}]`
				: `.${fieldName}`;
			const path = `${basePath}${endPath}`;
			if (fieldValue) {
				map.set(fieldValue, path);
			}

			const newFieldValue = Array.isArray(fieldValue) ? [] : {};
			newCurrent[fieldName] = newFieldValue;
			Object.keys(fieldValue).forEach((key) => {
				process(current, fieldValue, path, key, newFieldValue);
			});
		}
	}

	return newRoot;
}
