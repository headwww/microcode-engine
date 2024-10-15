import { isObject } from './is-object';

/**
 * isPlainObject 函数的主要作用是检查一个值是否为纯对象。
 * 这在 JavaScript 中很有用，因为不是所有的对象都是通过 {} 或 Object 创建的，
 * 有些对象可能是通过构造函数、类或其他方式创建的，具有不同的原型链。
 * 这个函数帮助确保对象是标准的、没有定制原型的对象。
 *
 * @param value
 * @returns
 */
export function isPlainObject(value: any): value is any {
	if (!isObject(value)) {
		return false;
	}
	const proto = Object.getPrototypeOf(value);
	return (
		proto === Object.prototype ||
		proto === null ||
		Object.getPrototypeOf(proto) === null
	);
}
