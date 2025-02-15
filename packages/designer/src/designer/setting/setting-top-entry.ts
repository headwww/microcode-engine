import {
	IPublicApiSetters,
	IPublicModelEditor,
	IPublicModelSettingTopEntry,
	IPublicTypeCustomView,
} from '@arvin-shu/microcode-types';
import {
	createModuleEventBus,
	IEventBus,
} from '@arvin-shu/microcode-editor-core';
import { isCustomView } from '@arvin-shu/microcode-utils';
import { computed } from 'vue';
import { IComponentMeta } from '../../component-meta';
import { INode } from '../../document';
import { ISettingField, SettingField } from './setting-field';
import { IDesigner } from '../designer';
import { ISettingEntry } from './setting-entry-type';

function generateSessionId(nodes: INode[]) {
	return nodes
		.map((node) => node.id)
		.sort()
		.join(',');
}

export interface ISettingTopEntry
	extends ISettingEntry,
		IPublicModelSettingTopEntry<INode, ISettingField> {
	readonly top: ISettingTopEntry;

	readonly parent: ISettingTopEntry;

	readonly path: never[];

	items: Array<ISettingField | IPublicTypeCustomView>;

	componentMeta: IComponentMeta | null;

	purge(): void;

	getExtraPropValue(propName: string): void;

	setExtraPropValue(propName: string, value: any): void;
}

export class SettingTopEntry implements ISettingTopEntry {
	private emitter: IEventBus = createModuleEventBus('SettingTopEntry');

	private _items: Array<SettingField | IPublicTypeCustomView> = [];

	private _settingFieldMap: { [prop: string]: ISettingField } = {};

	// 是否是同一个组件
	private _isSame = true;

	// 组件元数据
	private _componentMeta: IComponentMeta | null = null;

	readonly path = [];

	readonly top = this;

	readonly parent = this;

	get componentMeta() {
		return this._componentMeta;
	}

	get items() {
		return this._items;
	}

	/**
	 * 一个
	 */
	get isSingle(): boolean {
		return this.nodes.length === 1;
	}

	get isLocked(): boolean {
		return this.first.isLocked;
	}

	/**
	 * 多个
	 */
	get isMultiple(): boolean {
		return this.nodes.length > 1;
	}

	readonly id: string;

	readonly first: INode;

	/**
	 * 同样的
	 */
	get isSameComponent(): boolean {
		return this._isSame;
	}

	readonly designer: IDesigner | undefined;

	readonly setters: IPublicApiSetters;

	disposeFunctions: any[] = [];

	constructor(
		readonly editor: IPublicModelEditor,
		readonly nodes: INode[]
	) {
		if (!Array.isArray(nodes) || nodes.length < 1) {
			throw new ReferenceError('nodes should not be empty');
		}
		this.id = generateSessionId(nodes);
		this.first = nodes[0];
		this.designer = this.first.document?.designer;
		this.setters = editor.get('setters') as IPublicApiSetters;

		this.setupComponentMeta();
		this.setupItems();
		this.disposeFunctions.push(this.setupEvents());
	}

	/**
	 * 设置组件元数据
	 */
	private setupComponentMeta() {
		const { first } = this;
		const meta = first.componentMeta;
		const l = this.nodes.length;
		let theSame = true;
		// 多选情况判断是否是同一个组件
		for (let i = 1; i < l; i++) {
			const other = this.nodes[i];
			if (other.componentMeta !== meta) {
				theSame = false;
				break;
			}
		}
		if (theSame) {
			// 如果都是同一个组件，则设置组件元数据，
			this._isSame = true;
			this._componentMeta = meta;
		} else {
			// 如果都不是同一个组件，则设置组件元数据为null
			this._isSame = false;
			this._componentMeta = null;
		}
	}

	private setupItems() {
		if (this.componentMeta) {
			const settingFieldMap: { [prop: string]: ISettingField } = {};

			const settingFieldCollector = (
				name: string | number,
				field: ISettingField
			) => {
				settingFieldMap[name] = field;
			};

			this._items = this.componentMeta.configure.map((item) => {
				if (isCustomView(item)) {
					return item;
				}
				return new SettingField(this, item, settingFieldCollector);
			});

			this._settingFieldMap = settingFieldMap;
		}
	}

	private setupEvents() {
		this.componentMeta?.onMetadataChange(() => {
			this.setupItems();
		});
	}

	private readonly computedValue = computed(() => this.first.propsData);

	/**
	 * 获取当前属性值
	 */
	getValue() {
		return this.computedValue.value;
	}

	/**
	 * 设置当前属性值
	 */
	setValue(val: any) {
		this.setProps(val);
	}

	/**
	 * 获取子项
	 */
	get(propName: string | number): ISettingField | null {
		if (!propName) return null;
		return (
			this._settingFieldMap[propName] ||
			new SettingField(this, { name: propName })
		);
	}

	/**
	 * 设置子级属性值
	 */
	setPropValue(propName: string | number, value: any) {
		this.nodes.forEach((node) => {
			node.setPropValue(propName.toString(), value);
		});
	}

	/**
	 * 清除已设置值
	 */
	clearPropValue(propName: string | number) {
		this.nodes.forEach((node) => {
			node.clearPropValue(propName.toString());
		});
	}

	/**
	 * 获取子级属性值
	 */
	getPropValue(propName: string | number): any {
		return this.first.getProp(propName.toString(), true)?.getValue();
	}

	/**
	 * 获取顶层附属属性值
	 */
	getExtraPropValue(propName: string) {
		return this.first.getExtraProp(propName, false)?.getValue();
	}

	/**
	 * 设置顶层附属属性值
	 */
	setExtraPropValue(propName: string, value: any) {
		this.nodes.forEach((node) => {
			node.getExtraProp(propName, true)?.setValue(value);
		});
	}

	// 设置多个属性值，替换原有值
	setProps(data: object) {
		this.nodes.forEach((node) => {
			node.setProps(data as any);
		});
	}

	// 设置多个属性值，和原有值合并
	mergeProps(data: object) {
		this.nodes.forEach((node) => {
			node.mergeProps(data as any);
		});
	}

	private disposeItems() {
		this._items.forEach((item) => isPurgeable(item) && item.purge());
		this._items = [];
	}

	purge() {
		this.disposeItems();
		this._settingFieldMap = {};
		this.emitter.removeAllListeners();
		this.disposeFunctions?.forEach((f) => f?.());
		this.disposeFunctions = [];
	}

	getProp(propName: string | number) {
		return this.get(propName);
	}

	getId() {
		return this.id;
	}

	getPage() {
		return this.first.document;
	}

	get node() {
		return this.getNode();
	}

	getNode() {
		return this.nodes[0];
	}
}

interface Purgeable {
	purge(): void;
}
function isPurgeable(obj: any): obj is Purgeable {
	return obj && obj.purge;
}
