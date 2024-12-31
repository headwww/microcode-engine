import { IPublicEnumDragObjectType } from '@arvin-shu/microcode-types';
import { isObject } from '../is-object';

/**
 * 判断拖拽对象是否为任意对象类型
 * @param obj 需要判断的对象
 * @returns 如果对象不是NodeData或Node类型,则返回true,否则返回false
 */
export function isDragAnyObject(obj: any): boolean {
	// 首先判断是否为对象类型
	if (!isObject(obj)) {
		return false;
	}
	// 判断对象类型是否不为NodeData和Node
	return (
		obj.type !== IPublicEnumDragObjectType.NodeData &&
		obj.type !== IPublicEnumDragObjectType.Node
	);
}
