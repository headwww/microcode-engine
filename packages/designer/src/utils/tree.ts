import { NodeChildren } from '../document/node/node-children';

type IterableArray = NodeChildren | any[];

/**
 * 从后向前遍历数组或NodeChildren集合
 * @param arr 要遍历的数组或NodeChildren集合
 * @param action 对每个元素执行的操作函数
 * @param getter 获取数组元素的函数
 * @param context 执行上下文对象
 */
export function foreachReverse(
	arr: IterableArray,
	action: (item: any) => void,
	getter: (arr: IterableArray, index: number) => any,
	context: any = {}
) {
	for (let i = arr.length - 1; i >= 0; i--) {
		action.call(context, getter(arr, i));
	}
}
