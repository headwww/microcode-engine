import {
	hasOwnProperty,
	isJSExpression,
	isJSSlot,
	isNodeSchema,
	isPlainObject,
	uniqueId,
} from '@arvin-shu/microcode-utils';
import { computed, Ref, ref, ShallowReactive, shallowReactive } from 'vue';
import {
	GlobalEvent,
	IPublicEnumTransformStage,
	IPublicModelProp,
	IPublicTypeCompositeValue,
	IPublicTypeJSSlot,
	IPublicTypeSlotSchema,
} from '@arvin-shu/microcode-types';
import { engineConfig } from '@arvin-shu/microcode-editor-core';
import { isFinite } from 'lodash';
import { INode, ISlotNode } from '../node';
import { IPropParent, IProps } from './props';
import { valueToSource } from './value-to-source';

/**
 * 定义未设置值的常量
 */
export const UNSET = Symbol.for('unset');

export type UNSET = typeof UNSET;

/**
 * 属性值的类型定义:
 * - unset: 未设置值
 * - literal: 字面量值,如字符串、数字、布尔值等基本类型
 * - map: 对象类型,key-value结构
 * - list: 数组类型
 * - expression: JS表达式
 * - slot: 插槽
 */
export type ValueTypes =
	| 'unset'
	| 'literal'
	| 'map'
	| 'list'
	| 'expression'
	| 'slot';

/**
 * 属性接口定义,继承自IPublicModelProp和IPropParent
 */
export interface IProp
	extends Omit<IPublicModelProp<INode>, 'exportSchema' | 'node'>,
		IPropParent {
	// 属性展开标志
	spread: Ref<boolean>;

	// 属性key
	key: Ref<string | number | undefined>;

	// 所属属性组
	readonly props: IProps;

	// 所属节点
	readonly owner: INode;

	// 删除属性
	delete(prop: IProp): void;

	// 导出属性数据
	export(stage: IPublicEnumTransformStage): IPublicTypeCompositeValue;

	// 获取所属节点
	getNode(): INode;

	// 获取属性值的字符串表示
	getAsString(): string;

	// 取消设置属性值
	unset(): void;

	// 获取属性值
	get value(): IPublicTypeCompositeValue | UNSET;

	// 比较两个属性是否相等
	compare(other: IProp | null): number;

	// 判断是否未设置值
	isUnset(): boolean;

	// 清除属性
	purge(): void;

	// 设置子属性
	setupItems(): IProp[] | null;

	// 判断是否为虚拟属性
	isVirtual(): boolean;

	// 获取属性类型
	get type(): ValueTypes;

	// 获取属性大小
	get size(): number;

	// 获取属性代码
	get code(): string;
}

/**
 * 属性类,实现IProp接口
 */
export class Prop implements IProp {
	// 标识是否为Prop实例
	readonly isProp = true;

	// 所属节点
	readonly owner: INode;

	// 属性key
	key: Ref<string | number | undefined> = ref();

	// 属性展开标志,类似于<Button {...props} />
	spread: Ref<boolean> = ref(false);

	// 所属属性组
	readonly props: IProps;

	// 属性配置选项
	readonly options: any;

	// 唯一标识符
	readonly id = uniqueId('prop$');

	// 属性类型
	private _type = ref<ValueTypes>('unset');

	get type(): ValueTypes {
		return this._type.value;
	}

	// 属性值
	private _value = ref<any>(UNSET);

	// 计算属性值
	private readonly computedValue = computed(() =>
		this.export(IPublicEnumTransformStage.Serilize)
	);

	get value() {
		return this.computedValue.value;
	}

	// 属性代码
	private _code: string | null = null;

	// 计算属性代码
	private readonly computedCode = computed(() => {
		if (isJSExpression(this.value)) {
			return this.value.value;
		}
		if (this.type === 'slot') {
			return JSON.stringify(
				this._slotNode!.export(IPublicEnumTransformStage.Save)
			);
		}
		// 如果已经存在code，则返回code，否则返回value的JSON字符串
		return this._code != null ? this._code : JSON.stringify(this.value);
	});

	get code() {
		return this.computedCode.value;
	}

	set code(code: string) {
		if (isJSExpression(this._value)) {
			this.setValue({
				...this._value,
				value: code,
			});
			this._code = code;
			return;
		}

		try {
			const v = JSON.parse(code);
			this.setValue(v);
			this._code = code;
			return;
		} catch (e) {
			e;
		}
		this.setValue({
			type: 'JSExpression',
			value: code,
			mock: this._value.value,
		});
		this._code = code;
	}

	// 插槽节点引用
	private _slotNode?: INode | null;

	get slotNode(): INode | null {
		return this._slotNode || null;
	}

	// 子属性列表
	private _items: ShallowReactive<IProp[]> = shallowReactive([]);

	// 子属性映射表
	private _maps: ShallowReactive<Map<string | number, IProp>> = shallowReactive(
		new Map()
	);

	// 计算子属性列表
	private readonly computedItems = computed((): IProp[] => {
		if (this._items.length > 0) return this._items;
		if (this._type.value === 'list') {
			// 列表类型
			this._maps.clear();
			const data = this._value.value;
			data.forEach((item: any, idx: number) => {
				let prop: IProp;
				const idxStr = idx.toString();

				if (this._maps.has(idxStr)) {
					prop = this._maps.get(idxStr)!;
					prop.setValue(item);
				} else {
					prop = new Prop(this, item, idx);
				}

				// 直接设置到现有的 Map
				this._maps.set(idxStr, prop);
				this._items.push(prop);
			});
		} else if (this._type.value === 'map') {
			// 直接清空并更新现有的 Map
			this._maps.clear();
			const data = this._value.value;

			for (const key of Object.keys(data)) {
				let prop: IProp;
				if (this._maps.has(key)) {
					prop = this._maps.get(key)!;
					prop.setValue(data[key]);
				} else {
					prop = new Prop(this, data[key], key);
				}

				// 直接更新现有的集合
				this._items.push(prop);
				this._maps.set(key, prop);
			}
		} else {
			this._items.length = 0;
			this._maps.clear();
		}
		return this._items;
	});

	get items(): IProp[] {
		return this.computedItems.value;
	}

	// 计算子属性映射表
	private readonly computedMaps = computed(() => {
		if (this._items.length === 0) {
			return null;
		}
		return this._maps;
	});

	get maps(): Map<string | number, IProp> | null {
		return this.computedMaps.value;
	}

	// 获取属性路径
	get path(): string[] {
		return (this.parent.path || []).concat(this.key.value as string);
	}

	/**
	 * 元素个数
	 */
	get size(): number {
		return this.items?.length || 0;
	}

	// 标记是否已清除
	private purged = false;

	/**
	 * 构造函数
	 * @param parent 父级节点
	 * @param value 属性值
	 * @param key 属性key
	 * @param spread 是否展开 类似于<Button {...props} />;
	 * @param options 其他配置
	 */
	constructor(
		public parent: IPropParent,
		value: IPublicTypeCompositeValue | UNSET = UNSET,
		key?: string | number,
		spread = false,
		options = {}
	) {
		this.owner = parent.owner;
		this.props = parent.props;
		this.key.value = key;
		this.spread.value = spread;
		this.options = options;
		if (value !== UNSET) {
			this.setValue(value);
		}
		this.setupItems();
	}

	/**
	 * 设置子属性
	 */
	setupItems() {
		return this.items;
	}

	/**
	 * 获取指定属性名的值
	 */
	getPropValue(propName: string | number): any {
		return this.get(propName)!.getValue();
	}

	/**
	 * 设置指定属性名的值
	 */
	setPropValue(propName: string | number, value: any): void {
		this.set(propName, value);
	}

	/**
	 * 清除指定属性名的值
	 */
	clearPropValue(propName: string | number): void {
		this.get(propName, false)?.unset();
	}

	/**
	 * 导出属性数据
	 * @param stage 导出阶段
	 * @returns 导出数据
	 */
	export(
		stage: IPublicEnumTransformStage = IPublicEnumTransformStage.Save
	): IPublicTypeCompositeValue {
		const type = this._type.value;
		if (
			stage === IPublicEnumTransformStage.Render &&
			this.key.value === '___condition___'
		) {
			// 在设计器里，所有组件默认需要展示，除非开启了 enableCondition 配置
			// 当enableCondition === false的时候设计器中___condition___默认显示
			if (engineConfig?.get('enableCondition') !== true) {
				return true;
			}
			return this._value.value;
		}

		if (type === 'unset') {
			return undefined;
		}

		if (type === 'literal' || type === 'expression') {
			return this._value.value;
		}
		if (type === 'slot') {
			const schema = this._slotNode?.export(stage) || ({} as any);
			if (stage === IPublicEnumTransformStage.Render) {
				return {
					type: 'JSSlot',
					params: schema.params,
					value: schema,
					id: schema.id,
				};
			}
			return {
				type: 'JSSlot',
				params: schema.params,
				value: schema.children,
				title: schema.title,
				name: schema.name,
				id: schema.id,
			};
		}

		if (type === 'map') {
			// 如果子属性列表不存在，则返回当前值
			if (!this._items) {
				return this._value.value;
			}
			let maps: any;
			this.items!.forEach((prop, key) => {
				if (!prop.isUnset()) {
					const v = prop.export(stage);
					if (v != null) {
						maps = maps || {};
						maps[prop.key.value || key] = v;
					}
				}
			});
			return maps;
		}

		if (type === 'list') {
			if (!this._items) {
				return this._value.value;
			}
			return this.items!.map((prop) => prop?.export(stage));
		}
	}

	/**
	 * 获取属性值的字符串表示
	 */
	getAsString(): string {
		if (this.type === 'literal') {
			return this._value.value ? String(this._value.value) : '';
		}
		return '';
	}

	/**
	 * 设置属性值
	 * @param val 要设置的值
	 */
	setValue(val: IPublicTypeCompositeValue) {
		if (val === this._value.value) return;
		const oldValue = this._value.value;
		this._value.value = val;
		this._code = null;
		const t = typeof val;
		if (val === null) {
			this._type.value = 'literal';
		} else if (t === 'string' || t === 'number' || t === 'boolean') {
			this._type.value = 'literal';
		} else if (Array.isArray(val)) {
			this._type.value = 'list';
		} else if (isPlainObject(val)) {
			if (isJSSlot(val)) {
				// 插槽类型
				this.setAsSlot(val);
			} else if (isJSExpression(val)) {
				// 表达式类型
				this._type.value = 'expression';
			} else {
				// 普通对象类型
				this._type.value = 'map';
			}
		} else {
			this._type.value = 'expression';
			this._value.value = {
				type: 'JSExpression',
				value: valueToSource(val),
			};
		}

		this.dispose();
		this.setupItems();

		if (oldValue !== this._value.value) {
			this.emitChange({ oldValue });
		}
	}

	/**
	 * 通知属性变化
	 * @param oldValue 旧值
	 */
	emitChange({ oldValue }: { oldValue: IPublicTypeCompositeValue | UNSET }) {
		const editor = this.owner.document?.designer.editor;
		const propsInfo = {
			key: this.key.value,
			prop: this,
			oldValue,
			newValue: this.type === 'unset' ? undefined : this._value.value,
		};

		// 通知全局
		editor?.eventBus.emit(GlobalEvent.Node.Prop.InnerChange, {
			node: this.owner,
			...propsInfo,
		});

		// 通知节点
		this.owner.emitPropChange(propsInfo);
	}

	/**
	 * 获取属性值
	 */
	getValue(): IPublicTypeCompositeValue {
		return this.export(IPublicEnumTransformStage.Serilize);
	}

	/**
	 * 清理资源
	 */
	private dispose() {
		if (this._items.length) {
			this._items.forEach((prop) => prop.purge());
		}

		// 清空数组
		this._items.length = 0;

		// 清理slot节点
		if (this._type.value !== 'slot' && this._slotNode) {
			this._slotNode.remove();
			this._slotNode = undefined;
		}
	}

	/**
	 * 设置为插槽类型
	 * @param data 插槽数据
	 */
	setAsSlot(data: IPublicTypeJSSlot) {
		this._type.value = 'slot';
		// 插槽的序列化结构
		let slotSchema: IPublicTypeSlotSchema;
		// 当 data.value 的结构为 { componentName: 'Slot' } 时，复用部分 slotSchema 数据
		if (
			isPlainObject(data.value) &&
			isNodeSchema(data.value) &&
			data.value?.componentName === 'Slot'
		) {
			const value = data.value as IPublicTypeSlotSchema;
			slotSchema = {
				componentName: 'Slot',
				title: value.title || value.props?.slotTitle,
				id: value.id,
				name: value.name || value.props?.slotName,
				params: value.params || value.props?.slotParams,
				children: value.children,
			} as IPublicTypeSlotSchema;
		} else {
			slotSchema = {
				componentName: 'Slot',
				title: data.title,
				id: data.id,
				name: data.name,
				params: data.params,
				children: data.value,
			};
		}
		if (this._slotNode) {
			this._slotNode.import(slotSchema as any);
		} else {
			const { owner } = this.props;
			this._slotNode = owner.document?.createNode<ISlotNode>(slotSchema);
			if (this._slotNode) {
				owner.addSlot(this._slotNode);
				this._slotNode.internalSetSlotFor(this);
			}
		}
	}

	/**
	 * 取消设置属性值
	 */
	unset() {
		if (this._type.value !== 'unset') {
			this._type.value = 'unset';
			this.emitChange({
				oldValue: this._value.value,
			});
		}
	}

	/**
	 * 判断是否未设置值
	 */
	isUnset() {
		return this._type.value === 'unset';
	}

	/**
	 * 判断当前属性是否为虚拟属性
	 * 虚拟属性是以 ! 开头的属性，通常用于一些特殊用途的内部属性
	 * @returns {boolean} 如果是虚拟属性返回 true,否则返回 false
	 */
	isVirtual() {
		return (
			typeof this.key.value === 'string' && this.key.value.charAt(0) === '!'
		);
	}

	/**
	 * 比较两个Prop是否相等
	 * @param other 要比较的属性
	 * @returns 如果相等返回0,否则返回2
	 */
	compare(other: IProp | null): number {
		if (!other || other.isUnset()) {
			return this.isUnset() ? 0 : 2;
		}
		if (other.type !== this.type) {
			return 2;
		}
		// list
		if (this.type === 'list') {
			return this.size === other.size ? 1 : 2;
		}
		if (this.type === 'map') {
			return 1;
		}

		// 'literal' | 'map' | 'expression' | 'slot'
		return this.code === other.code ? 0 : 2;
	}

	/**
	 * 获取指定路径的属性
	 * @param path 属性路径
	 * @param createIfNone 如果不存在是否创建
	 * @returns 属性实例
	 */
	get(path: string | number, createIfNone = true): IProp | null {
		const type = this._type.value;
		if (
			type !== 'map' &&
			type !== 'list' &&
			type !== 'unset' &&
			!createIfNone
		) {
			return null;
		}

		const maps = type === 'map' ? this.maps : null;
		const items = type === 'list' ? this.items : null;
		let entry = path;
		let nest = '';
		if (typeof path !== 'number') {
			const i = path.indexOf('.');
			if (i > 0) {
				nest = path.slice(i + 1);
				if (nest) {
					entry = path.slice(0, i);
				}
			}
		}

		let prop: any;
		if (type === 'list') {
			if (isValidArrayIndex(entry, this.size)) {
				prop = items![entry];
			}
		} else if (type === 'map') {
			prop = maps?.get(entry);
		}

		if (prop) {
			return nest ? prop.get(nest, createIfNone) : prop;
		}

		if (createIfNone) {
			prop = new Prop(this, UNSET, entry);
			this.set(entry, prop, true);
			if (nest) {
				return prop.get(nest, true);
			}

			return prop;
		}

		return null;
	}

	/**
	 * 移除当前属性
	 */
	remove() {
		this.parent.delete(this);
		this.unset();
	}

	/**
	 * 删除指定属性
	 * @param prop 要删除的属性
	 */
	delete(prop: IProp): void {
		/* istanbul ignore else */
		if (this._items) {
			const i = this._items.indexOf(prop);
			if (i > -1) {
				this._items.splice(i, 1);
				prop.purge();
			}
			if (this._maps && prop.key) {
				this._maps.delete(String(prop.key));
			}
		}
	}

	/**
	 * 删除指定key的属性
	 * @param key 属性key
	 */
	deleteKey(key: string): void {
		/* istanbul ignore else */
		if (this.maps) {
			const prop = this.maps.get(key);
			if (prop) {
				this.delete(prop);
			}
		}
	}

	/**
	 * 添加属性值
	 * @param value 要添加的值
	 * @param force 是否强制添加
	 * @returns 添加的属性实例
	 */
	add(value: IPublicTypeCompositeValue, force = false): IProp | null {
		const type = this._type.value;
		if (type !== 'list' && type !== 'unset' && !force) {
			return null;
		}
		if (type === 'unset' || (force && type !== 'list')) {
			this.setValue([]);
		}
		const prop = new Prop(this, value);
		this._items = this._items || [];
		this._items.push(prop);
		return prop;
	}

	/**
	 * 设置属性值
	 * @param key 属性key
	 * @param value 属性值
	 * @param force 是否强制设置
	 * @returns 设置的属性实例
	 */
	set(
		key: string | number,
		value: IPublicTypeCompositeValue | Prop,
		force = false
	) {
		const type = this._type.value;

		if (type !== 'map' && type !== 'list' && type !== 'unset' && !force) {
			return null;
		}

		if (type === 'unset' || (force && type !== 'map')) {
			if (isValidArrayIndex(key)) {
				if (type !== 'list') {
					this.setValue([]);
				}
			} else {
				this.setValue({});
			}
		}

		const prop = isProp(value) ? value : new Prop(this, value, key);

		const items = this._items! || [];

		if (this.type === 'list') {
			if (!isValidArrayIndex(key)) {
				return null;
			}
			items[key] = prop;
			this._items = items;
		} else if (this.type === 'map') {
			const maps = this._maps || new Map<string, Prop>();
			const orig = maps?.get(key);
			if (orig) {
				const i = items.indexOf(orig);
				if (i > -1) {
					items.splice(i, 1, prop)[0].purge();
				}
				maps?.set(key, prop);
			} else {
				items.push(prop);
				this._items = items;
				maps?.set(key, prop);
			}
			this._maps = maps;
		} else {
			return null;
		}

		return prop;
	}

	/**
	 * 判断是否包含指定key的属性
	 * @param key 属性key
	 * @returns 是否包含
	 */
	has(key: string): boolean {
		if (this._type.value !== 'map') {
			return false;
		}
		if (this._maps) {
			return this._maps.has(key);
		}
		return hasOwnProperty(this._value, key);
	}

	/**
	 * 清除属性
	 */
	purge() {
		if (this.purged) {
			return;
		}
		this.purged = true;
		if (this._items) {
			this._items.forEach((item) => item.purge());
		}
		this._items.length = 0;
		this._maps.clear();
		if (this._slotNode && this._slotNode.slotFor === this) {
			this._slotNode.remove();
			this._slotNode = undefined;
		}
	}

	/**
	 * 迭代器实现
	 */
	[Symbol.iterator](): { next(): { value: IProp } } {
		let index = 0;
		const { items } = this;
		const length = items?.length || 0;
		return {
			next() {
				if (index < length) {
					return {
						value: items![index++],
						done: false,
					};
				}
				return {
					value: undefined as any,
					done: true,
				};
			},
		};
	}

	/**
	 * 遍历属性
	 * @param fn 遍历函数
	 */
	forEach(fn: (item: IProp, key: number | string | undefined) => void): void {
		const { items } = this;
		if (!items) {
			return;
		}
		const isMap = this._type.value === 'map';
		items.forEach((item, index) =>
			isMap ? fn(item, item.key.value) : fn(item, index)
		);
	}

	/**
	 * 映射属性
	 * @param fn 映射函数
	 * @returns 映射结果
	 */
	map<T>(fn: (item: IProp, key: number | string | undefined) => T): T[] | null {
		const { items } = this;
		if (!items) {
			return null;
		}
		const isMap = this._type.value === 'map';
		return items.map((item, index) =>
			isMap ? fn(item, item.key.value) : fn(item, index)
		);
	}

	/**
	 * 获取所属属性组
	 */
	getProps() {
		return this.props;
	}

	/**
	 * 获取所属节点
	 */
	getNode() {
		return this.owner;
	}
}

/**
 * 判断对象是否为Prop实例
 * @param obj 要判断的对象
 * @returns 是否为Prop实例
 */
export function isProp(obj: any): obj is Prop {
	return obj && obj.isProp;
}

/**
 * 检查是否为有效的数组索引
 * @param key 要检查的值
 * @param limit 限制值,默认为-1
 * @returns 如果值为有效的数组索引则返回true,否则返回false
 */
export function isValidArrayIndex(key: any, limit = -1): key is number {
	const n = parseFloat(String(key));
	return (
		n >= 0 && Math.floor(n) === n && isFinite(n) && (limit < 0 || n < limit)
	);
}
