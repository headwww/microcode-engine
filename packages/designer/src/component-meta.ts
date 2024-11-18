import {
	IPublicModelComponentMeta,
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
		// string | i18nData | ReactElement
		// TitleConfig title.label
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
