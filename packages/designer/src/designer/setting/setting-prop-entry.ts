import { computed, ref, toRaw } from 'vue';
import {
	isJSExpression,
	isSettingField,
	uniqueId,
} from '@arvin-shu/microcode-utils';
import {
	GlobalEvent,
	IPublicApiSetters,
	IPublicModelEditor,
	IPublicModelSettingField,
	IPublicTypeFieldExtraProps,
	IPublicTypeSetValueOptions,
} from '@arvin-shu/microcode-types';
import {
	createModuleEventBus,
	IEventBus,
} from '@arvin-shu/microcode-editor-core';
import { ISettingTopEntry } from './setting-top-entry';
import { ISettingField } from './setting-field';
import { ISettingEntry } from './setting-entry-type';
import { IDesigner } from '../designer';
import { IComponentMeta } from '../../component-meta';
import { INode } from '../../document';

export interface ISettingPropEntry extends ISettingEntry {
	readonly isGroup: boolean;

	get props(): ISettingTopEntry;

	get name(): string | number | undefined;

	valueChange(options: IPublicTypeSetValueOptions): void;

	getKey(): string | number | undefined;

	setKey(key: string | number): void;

	getDefaultValue(): any;

	setUseVariable(flag: boolean): void;

	getProps(): ISettingTopEntry;

	isUseVariable(): boolean;

	getMockOrValue(): any;

	remove(): void;

	setValue(
		val: any,
		isHotValue?: boolean,
		force?: boolean,
		extraOptions?: IPublicTypeSetValueOptions
	): void;

	internalToShellField(): IPublicModelSettingField;
}
export class SettingPropEntry implements ISettingPropEntry {
	readonly emitter: IEventBus = createModuleEventBus('SettingPropEntry');

	readonly editor: IPublicModelEditor;

	readonly isSameComponent: boolean;

	readonly isMultiple: boolean;

	readonly isSingle: boolean;

	private _name = ref();

	readonly type: 'field' | 'group';

	readonly isGroup: boolean;

	readonly nodes: INode[];

	readonly top: ISettingTopEntry;

	readonly id = uniqueId('entry');

	readonly setters: IPublicApiSetters;

	readonly componentMeta: IComponentMeta | null;

	get name() {
		return this._name.value;
	}

	readonly designer: IDesigner | undefined;

	private readonly computedPath = computed(() => {
		const path = this.parent.path.slice();
		if (this.type === 'field' && this.name?.toString()) {
			path.push(this.name);
		}
		return path;
	});

	get path() {
		return this.computedPath.value;
	}

	extraProps: IPublicTypeFieldExtraProps = {};

	constructor(
		readonly parent: ISettingTopEntry | ISettingField,
		name: string | number | undefined,
		type?: 'field' | 'group'
	) {
		if (type == null) {
			const c = typeof name === 'string' ? name.slice(0, 1) : '';
			if (c === '#') {
				this.type = 'group';
			} else {
				this.type = 'field';
			}
		} else {
			this.type = type;
		}
		this._name.value = name;
		this.isGroup = this.type === 'group';
		this.editor = parent.editor;
		this.nodes = parent.nodes;
		this.setters = parent.setters;
		this.componentMeta = parent.componentMeta;
		this.isSameComponent = parent.isSameComponent;
		this.isMultiple = parent.isMultiple;
		this.isSingle = parent.isSingle;
		this.designer = parent.designer;
		this.top = parent.top;
	}

	getId() {
		return this.id;
	}

	setKey(key: string | number) {
		if (this.type !== 'field') {
			return;
		}
		const propName = this.path.join('.');
		let l = this.nodes.length;
		while (l-- > 0) {
			this.nodes[l].getProp(propName, true)!.key = key;
		}
		this._name.value = key;
	}

	getKey() {
		return this._name.value;
	}

	remove() {
		if (this.type !== 'field') {
			return;
		}
		const propName = this.path.join('.');
		let l = this.nodes.length;
		while (l-- > 0) {
			this.nodes[l].getProp(propName)?.remove();
		}
	}

	private readonly computedValueState = computed(() => {
		if (this.type !== 'field') {
			const { getValue } = this.extraProps;
			return getValue
				? getValue(this.internalToShellField()!, undefined) === undefined
					? 0
					: 1
				: 0;
		}

		if (this.nodes.length === 1) {
			return 2;
		}
		const propName = this.path.join('.');
		const first = this.nodes[0].getProp(propName)!;
		let l = this.nodes.length;
		let state = 2;
		while (--l > 0) {
			const next = this.nodes[l].getProp(propName, false);
			const s = first.compare(next);
			if (s > 1) {
				return -1;
			}
			if (s === 1) {
				state = 1;
			}
		}
		if (state === 2 && first.isUnset()) {
			return 0;
		}
		return state;
	});

	get valueState() {
		return this.computedValueState.value;
	}

	/**
	 * 获取当前属性值
	 */
	getValue(): any {
		let val: any;
		const self = toRaw(this);
		if (self.type === 'field' && self.name?.toString()) {
			val = toRaw(self.parent).getPropValue(self.name);
		}
		const { getValue } = self.extraProps;
		try {
			return getValue ? getValue(self.internalToShellField()!, val) : val;
		} catch (e) {
			// eslint-disable-next-line no-console
			console.warn(e);
			return val;
		}
	}

	/**
	 * 设置当前属性值
	 */
	setValue(
		val: any,
		isHotValue?: boolean,
		force?: boolean,
		extraOptions?: IPublicTypeSetValueOptions
	) {
		const self = toRaw(this);
		const oldValue = self.getValue();
		if (self.type === 'field') {
			self.name?.toString() && toRaw(self.parent).setPropValue(self.name, val);
		}

		const { setValue } = self.extraProps;
		if (setValue && !extraOptions?.disableMutator) {
			try {
				setValue(self.internalToShellField()!, val);
			} catch (e) {
				// eslint-disable-next-line no-console
				console.warn(e);
			}
		}
		self.notifyValueChange(oldValue, val);
		// 如果 fromSetHotValue，那么在 setHotValue 中已经调用过 valueChange 了
		if (!extraOptions?.fromSetHotValue) {
			self.valueChange(extraOptions);
		}
	}

	/**
	 * 清除已设置的值
	 */
	clearValue() {
		if (this.type === 'field') {
			this.name?.toString() && this.parent.clearPropValue(this.name);
		}
		const { setValue } = this.extraProps;
		if (setValue) {
			try {
				setValue(this.internalToShellField()!, undefined);
			} catch (e) {
				// eslint-disable-next-line no-console
				console.warn(e);
			}
		}
	}

	/**
	 * 获取子项
	 */
	get(propName: string | number) {
		const path = this.path.concat(propName).join('.');
		return this.top.get(path);
	}

	/**
	 * 设置子级属性值
	 */
	setPropValue(propName: string | number, value: any) {
		const path = this.path.concat(propName).join('.');
		this.top.setPropValue(path, value);
	}

	/**
	 * 清除已设置值
	 */
	clearPropValue(propName: string | number) {
		const path = this.path.concat(propName).join('.');
		this.top.clearPropValue(path);
	}

	/**
	 * 获取子级属性值
	 */
	getPropValue(propName: string | number): any {
		return this.top.getPropValue(this.path.concat(propName).join('.'));
	}

	/**
	 * 获取顶层附属属性值
	 */
	getExtraPropValue(propName: string) {
		return this.top.getExtraPropValue(propName);
	}

	/**
	 * 设置顶层附属属性值
	 */
	setExtraPropValue(propName: string, value: any) {
		this.top.setExtraPropValue(propName, value);
	}

	// ======= compatibles for vision ======
	getNode() {
		return this.nodes[0];
	}

	getName(): string {
		return this.path.join('.');
	}

	getProps() {
		return this.top;
	}

	isUseVariable() {
		return isJSExpression(this.getValue());
	}

	get props() {
		return this.top;
	}

	onValueChange(func: () => any) {
		this.emitter.on('valuechange', func);

		return () => {
			this.emitter.removeListener('valuechange', func);
		};
	}

	valueChange(options: IPublicTypeSetValueOptions = {}) {
		this.emitter.emit('valuechange', options);
		const self = toRaw(this);
		if (toRaw(self.parent) && isSettingField(self.parent)) {
			// @ts-ignore
			toRaw(self.parent).valueChange(options);
		}
	}

	notifyValueChange(oldValue: any, newValue: any) {
		this.editor.eventBus.emit(GlobalEvent.Node.Prop.Change, {
			node: this.getNode(),
			prop: this,
			oldValue,
			newValue,
		});
	}

	getDefaultValue() {
		return this.extraProps.defaultValue;
	}

	isIgnore() {
		return false;
	}

	getVariableValue() {
		const v = this.getValue();
		if (isJSExpression(v)) {
			return v.value;
		}
		return '';
	}

	setVariableValue(value: string) {
		const v = this.getValue();
		this.setValue({
			type: 'JSExpression',
			value,
			mock: isJSExpression(v) ? v.mock : v,
		});
	}

	setUseVariable(flag: boolean) {
		if (this.isUseVariable() === flag) {
			return;
		}
		const v = this.getValue();
		if (this.isUseVariable()) {
			this.setValue(v.mock);
		} else {
			this.setValue({
				type: 'JSExpression',
				value: '',
				mock: v,
			});
		}
	}

	get useVariable() {
		return this.isUseVariable();
	}

	getMockOrValue() {
		const v = this.getValue();
		if (isJSExpression(v)) {
			return v.mock;
		}
		return v;
	}

	internalToShellField(): IPublicModelSettingField {
		return this.designer!.shellModelFactory.createSettingField(this);
	}
}
