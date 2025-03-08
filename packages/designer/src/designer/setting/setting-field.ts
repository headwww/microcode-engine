import {
	IBaseModelSettingField,
	IPublicModelSettingField,
	IPublicTypeCustomView,
	IPublicTypeDynamicSetter,
	IPublicTypeFieldConfig,
	IPublicTypeFieldExtraProps,
	IPublicTypeSetterType,
	IPublicTypeSetValueOptions,
	IPublicTypeTitleContent,
} from '@arvin-shu/microcode-types';
import {
	cloneDeep,
	isCustomView,
	isDynamicSetter,
	isJSExpression,
	isSettingField,
} from '@arvin-shu/microcode-utils';
import { computed, ref } from 'vue';
import { ISettingTopEntry } from './setting-top-entry';
import { ISettingPropEntry, SettingPropEntry } from './setting-prop-entry';
import { intl } from '../../locale';
import { IComponentMeta } from '../../component-meta';
import { Transducer } from './utils';
import { INode } from '../../document';

export interface ISettingField
	extends ISettingPropEntry,
		Omit<
			IBaseModelSettingField<
				ISettingTopEntry,
				ISettingField,
				IComponentMeta,
				INode
			>,
			'setValue' | 'key' | 'node'
		> {
	readonly isSettingField: true;

	readonly isRequired: boolean;

	readonly isGroup: boolean;

	extraProps: IPublicTypeFieldExtraProps;

	get items(): Array<ISettingField | IPublicTypeCustomView>;

	get title(): string;

	get setter(): IPublicTypeSetterType | null;

	get expanded(): boolean;

	get valueState(): number;

	setExpanded(value: boolean): void;

	purge(): void;

	setValue(
		val: any,
		isHotValue?: boolean,
		force?: boolean,
		extraOptions?: IPublicTypeSetValueOptions
	): void;

	clearValue(): void;

	createField(config: IPublicTypeFieldConfig): ISettingField;

	internalToShellField(): IPublicModelSettingField;
}
export class SettingField extends SettingPropEntry implements ISettingField {
	readonly isSettingField = true;

	readonly isRequired: boolean;

	readonly transducer: Transducer;

	private _items: Array<ISettingField | IPublicTypeCustomView> = [];

	private hotValue: any;

	parent: ISettingTopEntry | ISettingField;

	private _config: IPublicTypeFieldConfig;

	extraProps: IPublicTypeFieldExtraProps;

	private _title?: IPublicTypeTitleContent;

	get title() {
		return (
			this._title ||
			(typeof this.name === 'number'
				? `${intl('Item')} ${this.name}`
				: this.name)
		);
	}

	private _setter?: IPublicTypeSetterType | IPublicTypeDynamicSetter;

	private _expanded = ref(true);

	constructor(
		parent: ISettingTopEntry | ISettingField,
		config: IPublicTypeFieldConfig,
		private settingFieldCollector?: (
			name: string | number,
			field: ISettingField
		) => void
	) {
		super(parent, config.name, config.type);
		const { title, items, setter, extraProps, ...rest } = config;
		this.parent = parent;
		this._config = config;
		this._title = title;
		this._setter = setter;
		this.extraProps = {
			...rest,
			...extraProps,
		};
		this.isRequired = config.isRequired || (setter as any)?.isRequired;

		this._expanded.value = !extraProps?.defaultCollapsed;
		if (items && items.length > 0) {
			this.initItems(items, settingFieldCollector);
		}
		if (this.type !== 'group' && settingFieldCollector && config.name) {
			settingFieldCollector(getSettingFieldCollectorKey(parent, config), this);
		}

		// TODO Transducer没有设计
		// this.transducer = new Transducer(this, { setter });
	}

	private readonly computedSetter = computed(() => {
		if (!this._setter) {
			return null;
		}
		if (isDynamicSetter(this._setter)) {
			const shellThis = this.internalToShellField();
			return (this._setter as IPublicTypeDynamicSetter)?.call(
				shellThis,
				shellThis!
			);
		}
		return this._setter;
	});

	get setter() {
		return this.computedSetter.value || null;
	}

	get expanded(): boolean {
		return this._expanded.value;
	}

	setExpanded(value: boolean) {
		this._expanded.value = value;
	}

	get items(): Array<ISettingField | IPublicTypeCustomView> {
		return this._items;
	}

	get config(): IPublicTypeFieldConfig {
		return this._config;
	}

	private initItems(
		items: Array<IPublicTypeFieldConfig | IPublicTypeCustomView>,
		settingFieldCollector?: {
			(name: string | number, field: ISettingField): void;
			(name: string, field: ISettingField): void;
		}
	) {
		this._items = items.map((item) => {
			if (isCustomView(item)) {
				return item;
			}
			return new SettingField(this, item, settingFieldCollector);
		});
	}

	private disposeItems() {
		this._items.forEach((item) => isSettingField(item) && item.purge());
		this._items = [];
	}

	// 创建子配置项，通常用于 object/array 类型数据
	createField(config: IPublicTypeFieldConfig): ISettingField {
		this.settingFieldCollector?.(
			getSettingFieldCollectorKey(this.parent, config),
			this
		);
		return new SettingField(this, config, this.settingFieldCollector);
	}

	purge() {
		this.disposeItems();
	}

	getConfig<K extends keyof IPublicTypeFieldConfig>(
		configName?: K
	): IPublicTypeFieldConfig[K] | IPublicTypeFieldConfig {
		if (configName) {
			return this.config[configName];
		}
		return this._config;
	}

	getItems(
		filter?: (item: ISettingField | IPublicTypeCustomView) => boolean
	): Array<ISettingField | IPublicTypeCustomView> {
		return this._items.filter((item) => {
			if (filter) {
				return filter(item);
			}
			return true;
		});
	}

	setValue(
		val: any,
		isHotValue?: boolean,
		force?: boolean,
		extraOptions?: IPublicTypeSetValueOptions
	) {
		if (isHotValue) {
			this.setHotValue(val, extraOptions);
			return;
		}
		super.setValue(val, false, false, extraOptions);
	}

	getHotValue(): any {
		if (this.hotValue) {
			return this.hotValue;
		}
		// avoid View modify
		let v = cloneDeep(this.getMockOrValue());
		if (v == null) {
			v = this.extraProps.defaultValue;
		}
		// TODO return this.transducer.toHot(v);
		return v;
	}

	setHotValue(data: any, options?: IPublicTypeSetValueOptions) {
		this.hotValue = data;
		// TODO      const value = this.transducer.toNative(data);
		const value = data;
		if (options) {
			options.fromSetHotValue = true;
		} else {
			options = { fromSetHotValue: true };
		}

		if (this.isUseVariable()) {
			const oldValue = this.getValue();
			if (isJSExpression(value)) {
				this.setValue(
					{
						type: 'JSExpression',
						value: value.value,
						mock: oldValue.mock,
					},
					false,
					false,
					options
				);
			} else {
				this.setValue(
					{
						type: 'JSExpression',
						value: oldValue.value,
						mock: value,
					},
					false,
					false,
					options
				);
			}
		} else {
			this.setValue(value, false, false, options);
		}

		// TODO valueChange
	}

	internalToShellField() {
		return this.designer!.shellModelFactory.createSettingField(this);
	}

	// TODO onEffect
}

/**
 * 生成设置字段的完整路径键值
 *
 * @description
 * 该函数通过遍历设置字段的父级节点，构建一个以点(.)分隔的路径字符串。
 * 路径从顶层节点开始，一直到当前字段，但会跳过 group 类型的字段。
 * 这个路径可以唯一标识设置面板中某个具体的设置字段。
 *
 * @example
 * 假设有如下设置结构：
 * style (object)
 *   └── font (object)
 *        └── size (number)
 * 生成的路径将会是：'style.font.size'
 *
 * @param parent - 当前字段的父级节点，可能是顶层入口(ISettingTopEntry)或者另一个设置字段(ISettingField)
 * @param config - 字段的配置信息，包含字段名称等属性
 *
 * @returns 返回完整的路径字符串，以点号(.)分隔
 *
 * @internal 该函数主要在以下场景使用：
 * 1. 在设置字段收集器中注册字段
 * 2. 用于唯一标识设置面板中的字段位置
 * 3. 便于通过路径快速定位和访问特定的设置字段
 */
function getSettingFieldCollectorKey(
	parent: ISettingTopEntry | ISettingField,
	config: IPublicTypeFieldConfig
) {
	// 从父节点开始遍历
	let cur = parent;
	// 初始化路径数组，将当前配置的名称作为第一个元素
	const path = [config.name];

	// 向上遍历父级节点，直到达到顶层节点
	while (cur !== parent.top) {
		// 只收集非分组类型的 SettingField 节点
		if (cur instanceof SettingField && cur.type !== 'group') {
			// 将父级字段名添加到路径数组的开头
			path.unshift(cur.name);
		}
		// 移动到下一个父级节点
		cur = cur.parent;
	}

	// 将路径数组用点号连接成字符串返回
	return path.join('.');
}
