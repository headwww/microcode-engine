import { BlockOutlined } from '@ant-design/icons-vue';
import {
	ConfigureSupportEvent,
	IPublicModelPluginContext,
	IPublicModelSettingField,
	IPublicTypeArrayOf,
	IPublicTypeFieldConfig,
	IPublicTypeObjectOf,
	IPublicTypeOneOfType,
	IPublicTypePropConfig,
	IPublicTypePropType,
	IPublicTypeSetterType,
	IPublicTypeTransformedComponentMetadata,
} from '@arvin-shu/microcode-types';
import {
	getLogger,
	isJSFunction,
	isPlainObject,
} from '@arvin-shu/microcode-utils';
import { toRaw } from 'vue';

/**
 * 注册内置的元数据转换器插件
 * 该插件包含三个主要转换器，按优先级顺序处理组件元数据：
 * 1. parseJSFuncTransducer (优先级1) - 处理函数字符串转换
 * 2. parseProps (优先级5) - 处理属性配置
 * 3. addonCombine (优先级10) - 组合最终配置界面
 */
export const registerBuiltinTransducer = (ctx: IPublicModelPluginContext) => {
	const { material } = ctx;
	return {
		init() {
			// 注册函数字符串转换器 - 将字符串形式的JS函数转换为实际的函数对象
			material.registerMetadataTransducer(
				parseJSFuncTransducer,
				1,
				'parse-func'
			);
			// 注册属性处理器 - 处理组件的props配置，包括继承、特殊属性识别等
			material.registerMetadataTransducer(parseProps, 5, 'parse-props');
			// 注册配置组合器 - 将所有配置整理为结构化的界面配置
			material.registerMetadataTransducer(addonCombine, 10, 'combine-props');
		},
	};
};

registerBuiltinTransducer.pluginName = '___builtin_transducer___';

/**
 * 函数字符串转换器的入口函数
 * 将元数据中的函数字符串转换为实际的函数对象
 */
function parseJSFuncTransducer(
	metadata: IPublicTypeTransformedComponentMetadata
): IPublicTypeTransformedComponentMetadata {
	parseJSFunc(metadata, false);
	return metadata;
}

/**
 * 递归处理对象中的函数字符串
 * 支持处理：
 * 1. 普通对象
 * 2. 数组
 * 3. 函数字符串
 */
function parseJSFunc(obj: any, enableAllowedKeys = true) {
	if (!obj) return;
	Object.keys(obj).forEach((key) => {
		const item = toRaw(obj[key]);
		if (isJSFunction(item)) {
			obj[key] = transformStringToFunction(item.value);
		} else if (Array.isArray(item)) {
			item.forEach((o) => parseJSFunc(o, enableAllowedKeys));
		} else if (isPlainObject(item)) {
			parseJSFunc(item, enableAllowedKeys);
		}
	});
	enableAllowedKeys;
}

const leadingFnRe = /^function/;
const leadingFnNameRe = /^\w+\s*\(/;
const logger = getLogger({ level: 'warn', bizName: 'skeleton:transducers' });

/**
 * 将函数字符串转换为实际的函数对象
 * 支持以下几种函数格式：
 * 1. 箭头函数：() => {} / val => {}
 * 2. 普通函数声明：setValue() {}
 * 3. 标准函数：function() {} / function setValue() {}
 */
function transformStringToFunction(str: string) {
	if (typeof str !== 'string') return str;

	let fn;
	// 处理普通函数声明格式
	if (leadingFnNameRe.test(str) && !leadingFnRe.test(str)) {
		str = `function ${str}`;
	}
	// 构建函数体，包含错误处理
	const fnBody = `
    return function() {
      const self = this;
      try {
        return (${str}).apply(self, arguments);
      } catch(e) {
        console.warn('call function which parsed by lowcode failed: ', e);
        return e.message;
      }
    };
  `;
	try {
		fn = new Function(fnBody)();
	} catch (e: any) {
		logger.error(str);
		logger.error(e.message);
	}
	return fn;
}

const EVENT_RE = /^on|after|before[A-Z][\w]*$/;

/**
 * 属性处理转换器
 * 主要功能：
 * 1. 处理属性继承
 * 2. 处理特殊属性（children, className, style等）
 * 3. 注册事件处理器
 * 4. 转换属性配置为编辑器可用的字段配置
 */
function parseProps(
	metadata: IPublicTypeTransformedComponentMetadata
): IPublicTypeTransformedComponentMetadata {
	const { configure = {} } = metadata;
	// TODO types后续补充
	let extendsProps: any = null;
	if (configure.props) {
		if (Array.isArray(configure.props)) {
			return metadata;
		}
		const { isExtends, override = [] } = configure.props;
		// 不开启继承时，直接返回configure配置
		if (!isExtends) {
			return {
				...metadata,
				configure: {
					...configure,
					props: [...override],
				},
			};
		}

		extendsProps = {};
		// 开启继承后，缓存重写内容的配置
		override.forEach((prop: any) => {
			extendsProps[prop.name] = prop;
		});
	}

	// 不存在 props 时，直接返回空配置
	if (!metadata.props) {
		return {
			...metadata,
			configure: {
				...configure,
				props: [],
			},
		};
	}
	const { component = {}, supports = {} } = configure;
	const supportedEvents: ConfigureSupportEvent[] | null = supports.events
		? null
		: [];
	const props: IPublicTypeFieldConfig[] = [];

	metadata.props.forEach((prop) => {
		const { name, propType, description } = prop;
		if (
			name === 'children' &&
			(component.isContainer ||
				propType === 'node' ||
				propType === 'element' ||
				propType === 'any')
		) {
			if (component.isContainer !== false) {
				component.isContainer = true;
				props.push(propConfigToFieldConfig(prop));
				return;
			}
		}

		if (EVENT_RE.test(name) && (propType === 'func' || propType === 'any')) {
			if (supportedEvents) {
				supportedEvents.push({
					name,
					description,
				});
				supports.events = supportedEvents;
			}
			return;
		}

		if (name === 'className' && (propType === 'string' || propType === 'any')) {
			if (supports.className == null) {
				supports.className = true;
			}
			return;
		}

		if (name === 'style' && (propType === 'object' || propType === 'any')) {
			if (supports.style == null) {
				supports.style = true;
			}
			return;
		}

		// 存在覆盖配置时
		if (extendsProps) {
			if (name in extendsProps) {
				prop = extendsProps[name];
			}
		}

		props.push(propConfigToFieldConfig(prop));
	});

	return {
		...metadata,
		configure: {
			...configure,
			props,
			supports,
			component,
		},
	};
}

function propConfigToFieldConfig(
	propConfig: IPublicTypePropConfig
): IPublicTypeFieldConfig {
	const { name, description } = propConfig;
	const title: any = {
		label: {
			type: 'i18n',
			'en-US': name,
			'zh-CN': description?.slice(0, 10) || name,
		},
		tip: description ? `${name} | ${description}` : undefined,
	};
	return {
		title,
		...propConfig,
		setter: propTypeToSetter(propConfig.propType),
	};
}

function propTypeToSetter(
	propType: IPublicTypePropType
): IPublicTypeSetterType {
	let typeName: string;
	let isRequired: boolean | undefined = false;
	if (typeof propType === 'string') {
		typeName = propType;
	} else if (typeof propType === 'object') {
		typeName = propType.type;
		isRequired = propType.isRequired;
	} else {
		typeName = 'string';
	}
	switch (typeName) {
		case 'string':
			return {
				componentName: 'StringSetter',
				isRequired,
				initialValue: '',
			};
		case 'number':
			return {
				componentName: 'NumberSetter',
				isRequired,
				initialValue: 0,
			};
		case 'bool':
			return {
				componentName: 'BoolSetter',
				isRequired,
				initialValue: false,
			};
		case 'oneOf':
			const dataSource = ((propType as IPublicTypeOneOfType).value || []).map(
				(value, index) => {
					const t = typeof value;
					return {
						label:
							t === 'string' || t === 'number' || t === 'boolean'
								? String(value)
								: `value ${index}`,
						value,
					};
				}
			);
			const componentName =
				dataSource.length >= 4 ? 'SelectSetter' : 'RadioGroupSetter';
			return {
				componentName,
				props: { dataSource, options: dataSource },
				isRequired,
				initialValue: dataSource[0] ? dataSource[0].value : null,
			};

		case 'element':
		case 'node':
			return {
				// slotSetter
				componentName: 'SlotSetter',
				props: {
					mode: typeName,
				},
				isRequired,
				initialValue: {
					type: 'JSSlot',
					value: [],
				},
			};
		case 'shape':
		case 'exact':
			const items = ((propType as any).value || []).map((item: any) =>
				propConfigToFieldConfig(item)
			);
			return {
				componentName: 'ObjectSetter',
				props: {
					config: {
						items,
						extraSetter: typeName === 'shape' ? propTypeToSetter('any') : null,
					},
				},
				isRequired,
				initialValue: (field: IPublicModelSettingField) => {
					const data: any = {};
					items.forEach((item: any) => {
						let initial = item.defaultValue;
						if (
							initial == null &&
							item.setter &&
							typeof item.setter === 'object'
						) {
							initial = (item.setter as any).initialValue;
						}
						data[item.name] = initial
							? typeof initial === 'function'
								? initial(field)
								: initial
							: null;
					});
					return data;
				},
			};
		case 'object':
		case 'objectOf':
			return {
				componentName: 'ObjectSetter',
				props: {
					config: {
						extraSetter: propTypeToSetter(
							typeName === 'objectOf'
								? (propType as IPublicTypeObjectOf).value
								: 'any'
						),
					},
				},
				isRequired,
				initialValue: {},
			};
		case 'array':
		case 'arrayOf':
			return {
				componentName: 'ArraySetter',
				props: {
					itemSetter: propTypeToSetter(
						typeName === 'arrayOf'
							? (propType as IPublicTypeArrayOf).value
							: 'any'
					),
				},
				isRequired,
				initialValue: [],
			};
		case 'func':
			return {
				componentName: 'FunctionSetter',
				isRequired,
			};
		case 'color':
			return {
				componentName: 'ColorSetter',
				isRequired,
			};
		case 'oneOfType':
			return {
				componentName: 'MixedSetter',
				props: {
					setters: (propType as IPublicTypeOneOfType).value.map((item) =>
						propTypeToSetter(item)
					),
				},
				isRequired,
			};
		default:
		// do nothing
	}
	return {
		componentName: 'MixedSetter',
		isRequired,
		props: {},
	};
}

/**
 * 配置组合转换器
 * 主要功能：
 * 1. 将所有配置整理为结构化的界面配置
 * 2. 分组处理：
 *    - 基础属性（Props）
 *    - 样式配置（Styles）
 *    - 事件处理（Events）
 *    - 高级配置（Advanced）：
 *      - 条件渲染（Condition）
 *      - 循环渲染（Loop）
 *      - 渲染键值（Key）
 * 3. 支持国际化配置
 */
function addonCombine(
	metadata: IPublicTypeTransformedComponentMetadata
): IPublicTypeTransformedComponentMetadata {
	const { componentName, configure = {} } = metadata;

	// 如果已经处理过，不再重新执行一遍
	if (configure.combined) {
		return metadata;
	}

	if (componentName === 'Leaf') {
		return {
			...metadata,
			configure: {
				...configure,
				combined: [
					{
						name: 'children',
						title: { type: 'i18n', 'zh-CN': '内容设置', 'en-US': 'Content' },
						setter: {
							componentName: 'MixedSetter',
							props: {
								setters: [
									{
										componentName: 'StringSetter',
										props: {
											multiline: true,
										},
										initialValue: '',
									},
									{
										componentName: 'ExpressionSetter',
										initialValue: {
											type: 'JSExpression',
											value: '',
										},
									},
								],
							},
						},
					},
				],
			},
		};
	}

	const { props, supports = {} } = configure as any;
	const isRoot: boolean =
		componentName === 'Page' || componentName === 'Component';
	const eventsDefinition: any[] = [];
	const supportedLifecycles = supports.lifecycles || (isRoot ? null : null);
	if (supportedLifecycles) {
		eventsDefinition.push({
			type: 'lifeCycleEvent',
			title: '生命周期',
			list: supportedLifecycles.map((event: any) =>
				typeof event === 'string' ? { name: event } : event
			),
		});
	}
	if (supports.events) {
		eventsDefinition.push({
			type: 'events',
			title: '事件',
			list: (supports.events || []).map((event: any) =>
				typeof event === 'string' ? { name: event } : event
			),
		});
	}

	//  通用设置
	let propsGroup = props ? [...props] : [];
	const basicInfo: any = {};
	if (componentName === 'Slot') {
		if (!configure.component) {
			configure.component = {
				isContainer: true,
			};
		} else if (typeof configure.component === 'object') {
			configure.component.isContainer = true;
		}
		basicInfo.icon = BlockOutlined;
		propsGroup = [
			{
				name: getConvertedExtraKey('title'),
				title: {
					type: 'i18n',
					'en-US': 'Slot Title',
					'zh-CN': '插槽标题',
				},
				setter: 'StringSetter',
				defaultValue: '插槽容器',
			},
		];
	}
	const stylesGroup: IPublicTypeFieldConfig[] = [];
	const advancedGroup: IPublicTypeFieldConfig[] = [];
	if (propsGroup) {
		let l = propsGroup.length;
		while (l-- > 0) {
			const item = propsGroup[l];
			if (
				item.name === '__style__' ||
				item.name === 'style' ||
				item.name === 'containerStyle' ||
				item.name === 'pageStyle'
			) {
				propsGroup.splice(l, 1);
				stylesGroup.push(item);
				if (
					item.extraProps?.defaultCollapsed &&
					item.name !== 'containerStyle'
				) {
					item.extraProps.defaultCollapsed = false;
				}
			}
		}
	}
	const combined: IPublicTypeFieldConfig[] = [
		{
			title: { type: 'i18n', 'zh-CN': '属性', 'en-US': 'Props' },
			name: '#props',
			items: propsGroup,
		},
	];
	if (supports.className) {
		stylesGroup.push({
			name: 'className',
			title: { type: 'i18n', 'zh-CN': '类名绑定', 'en-US': 'ClassName' },
			setter: 'ClassNameSetter',
		});
	}
	if (supports.style) {
		stylesGroup.push({
			name: 'style',
			title: { type: 'i18n', 'zh-CN': '行内样式', 'en-US': 'Style' },
			setter: 'StyleSetter',
			extraProps: {
				display: 'block',
			},
		});
	}
	if (stylesGroup.length > 0) {
		combined.push({
			name: '#styles',
			title: { type: 'i18n', 'zh-CN': '样式', 'en-US': 'Styles' },
			items: stylesGroup,
		});
	}

	if (eventsDefinition.length > 0) {
		combined.push({
			name: '#events',
			title: { type: 'i18n', 'zh-CN': '事件', 'en-US': 'Events' },
			items: [
				{
					name: '__events',
					title: { type: 'i18n', 'zh-CN': '事件设置', 'en-US': 'Events' },
					setter: {
						componentName: 'EventsSetter',
						props: {
							definition: eventsDefinition,
						},
					},
					getValue(field: IPublicModelSettingField, val?: any[]) {
						return val;
					},

					setValue(field: IPublicModelSettingField, eventData) {
						const { eventDataList, eventList } = eventData;
						Array.isArray(eventList) &&
							eventList.map((item) => {
								field.parent.clearPropValue(item.name);
								return item;
							});
						Array.isArray(eventDataList) &&
							eventDataList.map((item) => {
								field.parent.setPropValue(item.name, {
									type: 'JSFunction',
									// 需要传下入参
									value: `function(){return this.${
										item.relatedEventName
									}.apply(this,Array.prototype.slice.call(arguments).concat([${
										item.paramStr ? item.paramStr : ''
									}])) }`,
								});
								return item;
							});
					},
				},
			],
		});
	}

	if (!isRoot) {
		if (supports.condition !== false) {
			advancedGroup.push({
				name: getConvertedExtraKey('condition'),
				title: { type: 'i18n', 'zh-CN': '是否渲染', 'en-US': 'Condition' },
				defaultValue: true,
				setter: [
					{
						componentName: 'BoolSetter',
					},
					{
						componentName: 'VariableSetter',
					},
				],
				extraProps: {
					display: 'block',
				},
			});
		}
		if (supports.loop !== false) {
			advancedGroup.push({
				name: '#loop',
				title: { type: 'i18n', 'zh-CN': '循环', 'en-US': 'Loop' },
				items: [
					{
						name: getConvertedExtraKey('loop'),
						title: { type: 'i18n', 'zh-CN': '循环数据', 'en-US': 'Loop Data' },
						setter: [
							{
								componentName: 'JsonSetter',
								props: {
									label: {
										type: 'i18n',
										'zh-CN': '编辑数据',
										'en-US': 'Edit Data',
									},
									defaultValue: '[]',
								},
							},
							{
								componentName: 'VariableSetter',
							},
						],
					},
					{
						name: getConvertedExtraKey('loopArgs.0'),
						title: {
							type: 'i18n',
							'zh-CN': '迭代变量名',
							'en-US': 'Loop Item',
						},
						setter: {
							componentName: 'StringSetter',
							props: {
								placeholder: {
									type: 'i18n',
									'zh-CN': '默认为: item',
									'en-US': 'Defaults: item',
								},
							},
						},
					},
					{
						name: getConvertedExtraKey('loopArgs.1'),
						title: {
							type: 'i18n',
							'zh-CN': '索引变量名',
							'en-US': 'Loop Index',
						},
						setter: {
							componentName: 'StringSetter',
							props: {
								placeholder: {
									type: 'i18n',
									'zh-CN': '默认为: index',
									'en-US': 'Defaults: index',
								},
							},
						},
					},
					{
						name: 'key',
						title: { type: 'i18n', 'zh-CN': '循环 Key', 'en-US': 'Loop Key' },
						setter: [
							{
								componentName: 'StringSetter',
							},
							{
								componentName: 'VariableSetter',
							},
						],
					},
				],
				extraProps: {
					display: 'accordion',
				},
			});
		}

		if (supports.condition !== false || supports.loop !== false) {
			advancedGroup.push({
				name: 'key',
				title: {
					label: {
						type: 'i18n',
						'zh-CN': '渲染唯一标识 (key)',
						'en-US': 'Render unique identifier (key)',
					},
					tip: {
						type: 'i18n',
						'zh-CN': '搭配「条件渲染」或「循环渲染」时使用',
						'en-US': 'Used with 「Conditional Rendering」or「Cycle Rendering」',
					},
					docUrl: 'https://www.yuque.com/lce/doc/qm75w3',
				},
				setter: [
					{
						componentName: 'StringSetter',
					},
					{
						componentName: 'VariableSetter',
					},
				],
				extraProps: {
					display: 'block',
				},
			});
		}
	}
	if (advancedGroup.length > 0) {
		combined.push({
			name: '#advanced',
			title: { type: 'i18n', 'zh-CN': '高级', 'en-US': 'Advanced' },
			items: advancedGroup,
		});
	}

	return {
		...metadata,
		...basicInfo,
		configure: {
			...configure,
			combined,
		},
	};
}

/**
 * 生成带有特殊前缀的键名
 * 用于处理特殊配置项的键名转换
 */
const EXTRA_KEY_PREFIX = '___';
function getConvertedExtraKey(key: string): string {
	if (!key) {
		return '';
	}
	let _key = key;
	if (key.indexOf('.') > 0) {
		_key = key.split('.')[0];
	}
	return EXTRA_KEY_PREFIX + _key + EXTRA_KEY_PREFIX + key.slice(_key.length);
}
