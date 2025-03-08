import { uniqueId } from '@arvin-shu/microcode-utils';
import {
	IBaseModelProps,
	IPublicEnumTransformStage,
	IPublicTypeCompositeValue,
	IPublicTypePropsList,
	IPublicTypePropsMap,
} from '@arvin-shu/microcode-types';
import { ref, shallowReactive } from 'vue';
import { INode } from '../node';
import { IProp, Prop, UNSET } from './prop';

interface ExtrasObject {
	[key: string]: any;
}
// 额外属性的前缀标识符
export const EXTRA_KEY_PREFIX = '___';

/**
 * 转换额外属性的key
 * @param key 原始key
 * @returns 转换后的key
 *
 * 例如:
 * 输入: "foo.bar"
 * 输出: "___foo___bar"
 */
export function getConvertedExtraKey(key: string): string {
	if (!key) {
		return '';
	}
	let _key = key;
	// 如果key包含点号,取第一段作为基础key
	if (key.indexOf('.') > 0) {
		// eslint-disable-next-line prefer-destructuring
		_key = key.split('.')[0];
	}
	// 返回转换后的key格式: ___baseKey___remainingKey
	return EXTRA_KEY_PREFIX + _key + EXTRA_KEY_PREFIX + key.slice(_key.length);
}
/**
 * 还原额外属性的key
 * @param key 转换后的key
 * @returns 原始key
 *
 * 例如:
 * 输入: "___foo___bar"
 * 输出: "foo.bar"
 */
export function getOriginalExtraKey(key: string): string {
	return key.replace(new RegExp(`${EXTRA_KEY_PREFIX}`, 'g'), '');
}

export interface IPropParent {
	readonly props: IProps;

	readonly owner: INode;

	get path(): string[];

	delete(prop: IProp): void;
}

export interface IProps
	extends Omit<
			IBaseModelProps<IProp>,
			'getExtraProp' | 'getExtraPropValue' | 'setExtraPropValue' | 'node'
		>,
		IPropParent {
	getNode(): INode;

	get(path: string, createIfNone?: boolean): IProp | null;

	export(stage?: IPublicEnumTransformStage): {
		props?: IPublicTypePropsMap | IPublicTypePropsList;
		extras?: ExtrasObject;
	};

	merge(value: IPublicTypePropsMap, extras?: IPublicTypePropsMap): void;

	purge(): void;

	query(path: string, createIfNone: boolean): IProp | null;

	import(
		value?: IPublicTypePropsMap | IPublicTypePropsList | null,
		extras?: ExtrasObject
	): void;
}

export class Props implements IProps, IPropParent {
	readonly id = uniqueId('props');

	private items = shallowReactive<IProp[]>([]);

	private get maps(): Map<string, Prop> {
		const maps = new Map();
		if (this.items.length > 0) {
			this.items.forEach((item) => {
				if (item.key) {
					maps.set(item.key, item);
				}
			});
		}
		return maps;
	}

	readonly path = [];

	get props(): IProps {
		return this;
	}

	readonly owner: INode;

	get size(): number {
		return this.items.length;
	}

	type = ref<'map' | 'list'>('map');

	private purged = false;

	constructor(
		owner: INode,
		value?: IPublicTypePropsMap | IPublicTypePropsList | null,
		extras?: ExtrasObject
	) {
		this.owner = owner;
		if (Array.isArray(value)) {
			this.type.value = 'list';
			this.items = value.map(
				(item, idx) => new Prop(this, item.value, item.name || idx, item.spread)
			);
		} else if (value != null) {
			this.items = Object.keys(value).map(
				(key) => new Prop(this, value[key] as any, key, false)
			);
		}
		if (extras) {
			Object.keys(extras).forEach((key) => {
				this.items.push(
					new Prop(this, (extras as any)[key], getConvertedExtraKey(key))
				);
			});
		}
	}

	import(
		value?: IPublicTypePropsMap | IPublicTypePropsList | null,
		extras?: ExtrasObject
	) {
		const originItems = this.items;
		if (Array.isArray(value)) {
			this.type.value = 'list';
			this.items = value.map(
				(item, idx) => new Prop(this, item.value, item.name || idx, item.spread)
			);
		} else if (value != null) {
			this.type.value = 'map';
			this.items = Object.keys(value).map(
				(key) => new Prop(this, value[key] as any, key)
			);
		} else {
			this.type.value = 'map';
			this.items = [];
		}
		if (extras) {
			Object.keys(extras).forEach((key) => {
				this.items.push(
					new Prop(this, (extras as any)[key], getConvertedExtraKey(key))
				);
			});
		}
		originItems.forEach((item) => item.purge());
	}

	merge(value: IPublicTypePropsMap, extras?: IPublicTypePropsMap) {
		Object.keys(value).forEach((key) => {
			this.query(key, true)!.setValue(value[key] as any);
			this.query(key, true)!.setupItems();
		});
		if (extras) {
			Object.keys(extras).forEach((key) => {
				this.query(getConvertedExtraKey(key), true)!.setValue(
					extras[key] as any
				);
				this.query(getConvertedExtraKey(key), true)!.setupItems();
			});
		}
	}

	export(stage: IPublicEnumTransformStage = IPublicEnumTransformStage.Save): {
		props?: IPublicTypePropsMap | IPublicTypePropsList;
		extras?: ExtrasObject;
	} {
		if (this.items.length < 1) {
			return {};
		}
		const allProps = {} as any;
		let props: any = {};
		const extras: any = {};

		if (this.type.value === 'list') {
			props = [];
			this.items.forEach((item) => {
				const value = item.export(stage);
				let name = item.key as string;
				if (
					name &&
					typeof name === 'string' &&
					name.startsWith(EXTRA_KEY_PREFIX)
				) {
					name = getOriginalExtraKey(name);
					extras[name] = value;
				} else {
					props.push({
						spread: item.spread,
						name,
						value,
					});
				}
			});
		} else {
			this.items.forEach((item) => {
				const name = item.key as string;
				// 如果属性为空,或者属性未设置,或者属性为虚拟属性,则跳过
				if (name == null || item.isUnset() || item.isVirtual()) return;
				const value = item.export(stage);
				if (value != null) {
					allProps[name] = value;
				}
			});
			// TODO 此处后期可以做个转换器,将虚拟属性转换为静态属性
			const transformedProps = allProps;
			Object.keys(transformedProps).forEach((name) => {
				const value = transformedProps[name];
				if (typeof name === 'string' && name.startsWith(EXTRA_KEY_PREFIX)) {
					name = getOriginalExtraKey(name);
					extras[name] = value;
				} else {
					props[name] = value;
				}
			});
		}
		return { props, extras };
	}

	query(path: string, createIfNone = true): IProp | null {
		return this.get(path, createIfNone);
	}

	get(path: string, createIfNone = false): IProp | null {
		let entry = path;
		let nest = '';
		const i = path.indexOf('.');
		if (i > 0) {
			nest = path.slice(i + 1);
			if (nest) {
				entry = path.slice(0, i);
			}
		}

		let prop = this.maps.get(entry);

		if (!prop && createIfNone) {
			prop = new Prop(this, UNSET, entry);
			this.items.push(prop);
		}

		if (prop) {
			return nest ? prop.get(nest, createIfNone) : prop;
		}

		return null;
	}

	delete(prop: IProp): void {
		const i = this.items.indexOf(prop);
		if (i > -1) {
			this.items.splice(i, 1);
			prop.purge();
		}
	}

	deleteKey(key: string): void {
		this.items = this.items.filter((item, i) => {
			if (item.key === key) {
				item.purge();
				this.items.splice(i, 1);
				return false;
			}
			return true;
		});
	}

	add(
		value: IPublicTypeCompositeValue | null,
		key?: string | number,
		spread = false,
		options: any = {}
	): IProp {
		const prop = new Prop(this, value, key, spread, options);
		this.items.push(prop);
		return prop;
	}

	/**
	 * 是否存在 key
	 */
	has(key: string): boolean {
		return this.maps.has(key);
	}

	[Symbol.iterator](): { next(): { value: IProp } } {
		let index = 0;
		const { items } = this;
		const length = items.length || 0;
		return {
			next() {
				if (index < length) {
					return {
						value: items[index++],
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

	forEach(fn: (item: IProp, key: number | string | undefined) => void): void {
		this.items.forEach((item) => fn(item, item.key));
	}

	map<T>(fn: (item: IProp, key: number | string | undefined) => T): T[] | null {
		return this.items.map((item) => fn(item, item.key));
	}

	filter(fn: (item: IProp, key: number | string | undefined) => boolean) {
		return this.items.filter((item) => fn(item, item.key));
	}

	purge() {
		if (this.purged) {
			return;
		}
		this.purged = true;
		this.items.forEach((item) => item.purge());
	}

	getProp(path: string, createIfNone = true): IProp | null {
		return this.query(path, createIfNone) || null;
	}

	getPropValue(path: string): any {
		return this.getProp(path, false)?.value;
	}

	setPropValue(path: string, value: any) {
		this.getProp(path, true)!.setValue(value);
	}

	getNode() {
		return this.owner;
	}
}
