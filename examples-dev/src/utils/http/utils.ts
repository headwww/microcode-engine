type JsonValue =
	| string
	| number
	| boolean
	| null
	| undefined
	| JsonObject
	| JsonArray;
type JsonObject = { [key: string]: JsonValue };
type JsonArray = JsonValue[];

/**
 * 清理对象或数组中的空值，但保持数组索引位置
 *
 * @description
 * - 如果一个对象的所有属性都是 null 或 undefined，该对象将被转换为 null
 * - 如果数组元素是一个所有属性都为空的对象，该元素将被设置为 null 而不是被删除
 * - 保持数组原有的长度和索引位置
 * - 不会修改原始数据，返回新的数据结构
 *
 * @example
 * // 输入:
 * const input = {
 *   name: "test",
 *   info: {
 *     age: null,
 *     address: {
 *       street: null,
 *       city: undefined
 *     }
 *   },
 *   hobbies: [
 *     { type: null, frequency: undefined },
 *     { type: "reading", frequency: "daily" }
 *   ],
 *   emptyObj: { a: { b: null } }
 * }
 *
 * // 输出:
 * {
 *   name: "test",
 *   hobbies: [
 *     null,
 *     { type: "reading", frequency: "daily" }
 *   ]
 * }
 *
 * @template T - 输入值的类型，必须是 JsonValue 类型的子类型
 * @param {T} value - 要清理的值，可以是对象、数组或基本类型
 * @returns {T | null} 清理后的值，如果所有子值都为空，则返回 null
 */

export function cleanEmptyValues<T extends JsonValue>(value: T): T | null {
	// 处理基本类型
	if (value === null || value === undefined) {
		return null;
	}

	if (typeof value !== 'object') {
		return value;
	}

	// 处理数组
	if (Array.isArray(value)) {
		const cleanedArray = value.map((item) => cleanEmptyValues(item));
		// 检查数组是否全部为 null
		const hasValidValues = cleanedArray.some((item) => item !== null);
		return (hasValidValues ? cleanedArray : null) as T | null;
	}

	// 处理对象
	const cleanedObj: JsonObject = {};
	let hasValidValues = false;

	for (const key in value) {
		if (Object.prototype.hasOwnProperty.call(value, key)) {
			const cleanedValue = cleanEmptyValues((value as JsonObject)[key]);

			if (cleanedValue !== null && cleanedValue !== undefined) {
				cleanedObj[key] = cleanedValue;
				hasValidValues = true;
			}
		}
	}

	return (hasValidValues ? cleanedObj : null) as T | null;
}
