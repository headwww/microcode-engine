/*
 * @Author: shuwen 1243889238@qq.com
 * @Date: 2024-11-12 15:16:44
 * @LastEditors: shuwen 1243889238@qq.com
 * @LastEditTime: 2024-12-05 14:14:19
 * @FilePath: /microcode-engine/packages/designer/src/component-meta.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import {
	IPublicModelComponentMeta,
	IPublicTypeAdvanced,
	IPublicTypeComponentMetadata,
	IPublicTypeI18nData,
	IPublicTypeNpmInfo,
	IPublicTypeTitleContent,
} from '@arvin-shu/microcode-types';
import { VNode } from 'vue';
import { isTitleConfig } from '@arvin-shu/microcode-utils';
import { INode } from './document';
import { Designer } from './designer';

export interface IComponentMeta extends IPublicModelComponentMeta<INode> {
	setMetadata(metadata: IPublicTypeComponentMetadata): void;
}

export class ComponentMeta implements IComponentMeta {
	private _componentName: string;

	get componentName(): string {
		return this._componentName;
	}

	private _npm: IPublicTypeNpmInfo;

	get npm(): IPublicTypeNpmInfo {
		return this._npm;
	}

	set npm(npm: any) {
		this._npm = npm;
	}

	private _title?: IPublicTypeTitleContent;

	get title(): string | IPublicTypeI18nData | VNode {
		if (isTitleConfig(this._title)) {
			return (this._title?.label as any) || this.componentName;
		}
		return this._title || this.componentName;
	}

	constructor(
		readonly designer: Designer,
		data: IPublicTypeComponentMetadata
	) {
		this.parseMetadata(data);
	}

	get advanced(): IPublicTypeAdvanced {
		return {};
	}

	/**
	 * 解析组件元数据
	 * @param data
	 */
	private parseMetadata(data: IPublicTypeComponentMetadata) {
		const { componentName, npm } = data;
		this._componentName = componentName;
		this._npm = npm || this._npm;
	}

	/**
	 * 设置组件npm信息
	 * @param info
	 */
	setNpm(info: IPublicTypeNpmInfo) {
		if (!this._npm) {
			this._npm = info;
		}
	}

	/**
	 * 设置组件元数据
	 * @param metadata
	 */
	setMetadata(metadata: IPublicTypeComponentMetadata): void {
		this.parseMetadata(metadata);
	}

	checkNestingUp(): boolean {
		return true;
	}
}
