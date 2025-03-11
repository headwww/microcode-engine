import {
	IPublicApiSetters,
	IPublicModelEditor,
} from '@arvin-shu/microcode-types';
import { IDesigner } from '../designer';
import { ISettingField } from './setting-field';
import { INode } from '../../document';

export interface ISettingEntry {
	readonly designer: IDesigner | undefined;

	readonly id: string;

	/**
	 * 同样类型的节点
	 */
	readonly isSameComponent: boolean;

	/**
	 * 一个
	 */
	readonly isSingle: boolean;

	/**
	 * 多个
	 */
	readonly isMultiple: boolean;

	/**
	 * 编辑器引用
	 */
	readonly editor: IPublicModelEditor;

	readonly setters: IPublicApiSetters;

	/**
	 * 取得子项
	 */
	get: (propName: string | number) => ISettingField | null;

	readonly nodes: INode[];

	/**
	 * 获取 node 中的第一项
	 */
	getNode: () => any;
}
