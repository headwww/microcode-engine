import { IPublicTypeDragNodeDataObject } from '../type';

export interface IPublicModelDragon {
	/**
	 * 设置拖拽监听的区域 shell，以及自定义拖拽转换函数 boost
	 *
	 * @param shell 拖拽监听的区域
	 * @param boost 拖拽转换函数
	 */
	from(
		shell: Element,
		boost: (e: MouseEvent) => IPublicTypeDragNodeDataObject | null
	): any;
}
