import { VNode } from 'vue';
import { IPublicTypeActionContentObject } from './action-content-object';

export interface IPublicTypeComponentAction {
	name: string;

	/**
	 * 菜单名称
	 */
	content: string | VNode | IPublicTypeActionContentObject;

	/**
	 * 子集
	 */
	items?: IPublicTypeComponentAction[];
	/**
	 * 显示与否
	 * always: 无法禁用
	 */
	condition?: boolean | ((currentNode: any) => boolean) | 'always';

	/**
	 * 显示在工具条上
	 */
	important?: boolean;
}
