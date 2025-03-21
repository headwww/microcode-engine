import {
	IPublicTypeCompositeValue,
	IPublicTypeJSFunction,
	IPublicTypeNodeData,
	IPublicTypeNodeSchema,
} from '@arvin-shu/microcode-types';
import {
	Component,
	ComponentPublicInstance,
	computed,
	createCommentVNode,
	createTextVNode,
	Fragment,
	h,
	inject,
	InjectionKey,
	isVNode,
	mergeProps,
	onBeforeMount,
	provide,
	Ref,
	ref,
	type Slot,
	toDisplayString,
	toRaw,
	VNode,
	VNodeChild,
} from 'vue';
import { INode } from '@arvin-shu/microcode-designer';
import {
	getCurrentInstance,
	onMounted,
	onBeforeUpdate,
	onUpdated,
	onActivated,
	onDeactivated,
	onBeforeUnmount,
	onRenderTracked,
	onRenderTriggered,
	onUnmounted,
	onErrorCaptured,
	onServerPrefetch,
} from 'vue';
import { Hoc } from './leaf/hoc';
import { leafPropKeys, LeafProps, RendererProps } from './base';
import { useRendererContext } from './renderer-context';
import {
	isArray,
	isNil,
	ensureArray,
	RuntimeScope,
	isString,
	isNodeSchema,
	SchemaParser,
	isJSSlot,
	isSlotSchema,
	BlockScope,
	isJSExpression,
	camelCase,
	isFunction,
	mergeScope,
	isJSFunction,
	isI18nData,
	isObject,
	createObjectSplitter,
	toString,
	addToScope,
	AccessTypes,
	getI18n,
	isPromise,
	fromPairs,
	getCurrentNodeKey,
} from '../utils';
import { Live } from './leaf/live';
import { createHookCaller } from './lifecycles';
import { create } from '../data-source';

export type RenderComponent = (
	nodeSchema: IPublicTypeNodeData,
	scope: RuntimeScope,
	comp?: Component | typeof Fragment
) => VNode | VNode[] | null;

const VUE_LIFT_CYCLES_MAP = {
	beforeMount: onBeforeMount,
	mounted: onMounted,
	beforeUpdate: onBeforeUpdate,
	updated: onUpdated,
	activated: onActivated,
	deactivated: onDeactivated,
	beforeUnmount: onBeforeUnmount,
	renderTracked: onRenderTracked,
	renderTriggered: onRenderTriggered,
	unmounted: onUnmounted,
	errorCaptured: onErrorCaptured,
	serverPrefetch: onServerPrefetch,
};

// 适配 react lifecycle
const REACT_ADAPT_LIFT_CYCLES_MAP = {
	componentDidMount: onMounted,
	componentDidCatch: onErrorCaptured,
	shouldComponentUpdate: onBeforeUpdate,
	componentWillUnmount: onBeforeUnmount,
} as const;

export const LIFT_CYCLES_MAP = {
	...VUE_LIFT_CYCLES_MAP,
	...REACT_ADAPT_LIFT_CYCLES_MAP,
};

// 定义注入键，用于在 Vue 组件间传递锁定状态
const IS_LOCKED: InjectionKey<Ref<boolean>> = Symbol('IS_LOCKED');
const IS_ROOT_NODE: InjectionKey<boolean> = Symbol('IS_ROOT_NODE');

export function isLifecycleKey(
	key: string
): key is keyof typeof LIFT_CYCLES_MAP {
	return key in LIFT_CYCLES_MAP;
}

export function isVueLifecycleKey(
	key: string
): key is keyof typeof VUE_LIFT_CYCLES_MAP {
	return key in VUE_LIFT_CYCLES_MAP;
}

export function isReactLifecycleKey(
	key: string
): key is keyof typeof REACT_ADAPT_LIFT_CYCLES_MAP {
	return key in REACT_ADAPT_LIFT_CYCLES_MAP;
}

export function pickLifeCycles(lifeCycles: unknown) {
	const res: Record<string, unknown> = {};
	if (isObject(lifeCycles)) {
		for (const key in lifeCycles) {
			if (key in LIFT_CYCLES_MAP) {
				res[key] = lifeCycles[key];
			}
		}
	}
	return res;
}

/**
 * 管理组件的锁定状态的自定义 hook
 * 实现了锁定状态的继承机制：父组件锁定时，子组件也会被锁定
 *
 * @param defaultValue - 组件的初始锁定状态
 * @returns 返回一个计算属性，表示组件的当前锁定状态
 *
 * @example
 * ```ts
 * // 在组件中使用
 * const locked = useLocked(false);
 *
 * // 锁定组件
 * locked.value = true;
 *
 * // 检查锁定状态
 * if (locked.value) {
 *   // 组件被锁定的逻辑
 * }
 * ```
 */
export function useLocked(defaultValue: boolean) {
	// 创建组件自身的锁定状态
	const selfLocked = ref(defaultValue);

	// 注入父组件的锁定状态，如果没有父组件则为 null
	const parentLocked = inject(IS_LOCKED, null);

	// 创建计算属性，结合父组件和自身的锁定状态
	const locked = computed({
		// 如果父组件被锁定或自身被锁定，则返回 true
		get: () => parentLocked?.value || selfLocked.value,
		// 只能设置自身的锁定状态，不能更改父组件的锁定状态
		// eslint-disable-next-line no-return-assign
		set: (val) => (selfLocked.value = val),
	});

	// 向子组件提供当前的锁定状态
	provide(IS_LOCKED, locked);

	return locked;
}

export function useIsRootNode(isRootNode: boolean | null) {
	if (isRootNode) {
		provide(IS_ROOT_NODE, true);
	} else {
		isRootNode = inject(IS_ROOT_NODE, null);
		if (isRootNode == null) {
			provide(IS_ROOT_NODE, (isRootNode = true));
		} else if (isRootNode) {
			provide(IS_ROOT_NODE, false);
		}
	}

	return isRootNode;
}
export function useLeaf(
	leafProps: LeafProps,
	onChildShowChange: (
		schema: IPublicTypeNodeSchema,
		show: boolean
		// eslint-disable-next-line no-void
	) => void = () => void 0
) {
	const renderContext = useRendererContext();
	const { getNode, thisRequiredInJSE, designMode, wrapLeafComp } =
		renderContext;

	const parser = new SchemaParser({
		thisRequired: thisRequiredInJSE,
	});

	const isDesignMode = designMode === 'design';

	const node = leafProps.__schema.id ? getNode(leafProps.__schema.id) : null;

	const locked = node ? useLocked(node.isLocked) : ref(false);

	provide(getCurrentNodeKey, {
		mode: designMode,
		node,
		isDesignerEnv: isDesignMode,
	});

	/**
	 * 渲染节点 vnode
	 * @param schema - 节点 schema
	 * @param base - 节点 leaf 组件，根据 designMode 的不同而不同
	 * @param blockScope - 节点块级作用域
	 * @param comp - 节点渲染的组件，若不传入，则根据节点的 componentName 推断
	 */
	const render = (
		schema: IPublicTypeNodeData,
		base: Component,
		scope: RuntimeScope,
		comp?: Component | typeof Fragment
	): VNode | VNode[] | null => {
		// 如果节点的schema是字符串，则直接返回文本节点
		if (isString(schema)) {
			return createTextVNode(schema);
		}
		if (isNil(schema)) {
			return null;
		}
		if (!isNodeSchema(schema)) {
			// 当节点是函数或者表达式的时候怎么处理
			const result = parser.parseSchema(schema, scope);
			return createTextVNode(toDisplayString(result));
		}

		const { show, scene } = buildShow(schema, scope, isDesignMode);
		if (!show) {
			return createCommentVNode(`${scene} ${show}`);
		}
		const node = schema.id ? getNode(schema.id) : null;

		// 若不传入 comp，则根据节点的 componentName 推断
		const { componentName } = schema;
		if (!comp) {
			comp = renderContext.components[componentName];
			if (!comp) {
				if (componentName === 'Slot') {
					return ensureArray(schema.children)
						.flatMap((item) => render(item, base, scope))
						.filter((item): item is VNode => !isNil(item));
				}
				if (isDesignMode) {
					return h('div', `component[${componentName}] not found`);
				}

				comp = {
					setup(props, { slots }) {
						// eslint-disable-next-line no-console
						console.warn(`组件未找到, 组件名：${componentName}`);
						return h(
							'div',
							mergeProps(props, { class: 'mtc-component-not-found' }),
							slots
						);
					},
				};
			}
		}
		base = wrapLeafComp(componentName, comp, base);

		const ref = (inst: ComponentPublicInstance) => {
			renderContext.triggerCompGetCtx(schema, inst);
		};

		const { props: rawProps, slots: rawSlots } = buildSchema(schema);
		const { loop, buildLoopScope } = buildLoop(schema, scope);
		if (!loop) {
			const props = buildProps(rawProps, scope, node, null, { ref });
			const [vnodeProps, compProps] = splitProps(props);

			return h(
				base,
				{
					key: vnodeProps.key ?? schema.id,
					__comp: comp,
					__schema: schema,
					__scope: scope,
					__vnodeProps: vnodeProps,
					...compProps,
				},
				buildSlots(rawSlots, scope, node)
			);
		}

		if (!isArray(loop)) {
			// eslint-disable-next-line no-console
			console.warn(`循环对象必须是数组, type: ${toString(loop)}`);
			return null;
		}

		return loop.map((item, index, arr) => {
			const blockScope = buildLoopScope(item, index, arr.length);
			const props = buildProps(rawProps, scope, node, blockScope, { ref });
			const [vnodeProps, compProps] = splitProps(props);
			const mergedScope = mergeScope(scope, blockScope);
			return h(
				base,
				{
					key: vnodeProps.key ?? `${schema.id}--${index}`,
					__comp: comp,
					__scope: mergedScope,
					__schema: schema,
					__vnodeProps: vnodeProps,
					...compProps,
				},
				buildSlots(rawSlots, mergedScope, node)
			);
		});
	};

	/**
	 * 将单个属性 schema 转化成真实值
	 *
	 * @param schema - 属性 schema
	 * @param scope - 当前作用域
	 * @param blockScope - 当前块级作用域
	 * @param prop - 属性对象，仅在 design 模式下有值
	 */
	const buildNormalProp = (
		schema: unknown,
		scope: RuntimeScope,
		blockScope?: BlockScope | null,
		path?: string | null,
		node?: INode | null
	): any => {
		const prop = path ? node?.getProp(path, false) : null;
		if (isJSExpression(schema) || isJSFunction(schema)) {
			// 处理表达式和函数
			return parser.parseExpression(schema, scope);
		}
		if (isI18nData(schema)) {
			return parser.parseI18n(schema, scope);
		}
		if (isJSSlot(schema)) {
			// 处理属性插槽
			let slotParams: string[];
			let slotSchema:
				| IPublicTypeNodeData[]
				| IPublicTypeNodeSchema
				| SlotSchemaMap;
			if (prop?.slotNode) {
				// design 模式，从 prop 中导出 schema
				slotSchema = prop.slotNode.schema;
				slotParams = isSlotSchema(slotSchema) ? (slotSchema.params ?? []) : [];
			} else {
				// live 模式，直接获取 schema 值
				slotSchema = ensureArray(schema.value);
				slotParams = schema.params ?? [];
			}

			// 返回 slot 函数
			return (...args: unknown[]) => {
				// 解析插槽参数
				const slotScope = parser.parseSlotScope(args, slotParams);
				const vnodes: VNode[] = [];
				ensureArray(slotSchema).forEach((item) => {
					const vnode = renderComp(
						item,
						mergeScope(scope, blockScope, slotScope)
					);
					ensureArray(vnode).forEach((item) => vnodes.push(item));
				});
				return vnodes;
			};
		}
		if (isArray(schema)) {
			// 属性值为 array，递归处理属性的每一项
			return schema.map((item, idx) =>
				buildNormalProp(item, scope, blockScope, `${path}.${idx}`, node)
			);
		}
		if (schema && isObject(schema)) {
			// 属性值为 object，递归处理属性的每一项
			const res: Record<string, unknown> = {};
			Object.keys(schema).forEach((key) => {
				if (key.startsWith('__')) return;
				const val = schema[key];
				res[key] = buildNormalProp(
					val,
					scope,
					blockScope,
					`${path}.${key}`,
					node
				);
			});
			return res;
		}
		return schema;
	};

	/**
	 * 构建 ref prop，将 string ref 其转化为 function
	 *
	 * @param schema - prop schema
	 * @param scope - 当前作用域
	 * @param blockScope - 当前块级作用域
	 * @param prop - 属性对象，仅在 design 模式下有值
	 */
	const buildRefProp = (
		schema: unknown,
		scope: RuntimeScope,
		blockScope?: BlockScope | null,
		path?: string | null,
		node?: INode | null
	): any => {
		if (isString(schema)) {
			const field = schema;
			let lastInst: unknown = null;
			return (inst: unknown): void => {
				let { refs } = scope.$;
				if (Object.keys(refs).length === 0) {
					// eslint-disable-next-line no-multi-assign
					refs = scope.$.refs = {};
				}
				if (isNil(scope.__loopRefIndex)) {
					refs[field] = inst;
					if (field in scope) {
						scope[field] = inst;
					}
				} else {
					let target = refs[field] as unknown[];
					if (!isArray(target)) {
						// eslint-disable-next-line no-multi-assign
						target = refs[field] = [];
						if (field in scope) {
							// eslint-disable-next-line no-multi-assign
							target = scope[field] = target;
						}
					} else if (field in scope) {
						const scopeTarget = scope[field];
						if (!isArray(scopeTarget) || toRaw(scopeTarget) !== target) {
							// eslint-disable-next-line no-multi-assign
							target = scope[field] = target;
						} else {
							target = scopeTarget;
						}
					}
					if (isNil(inst)) {
						const idx = target.indexOf(lastInst);
						idx >= 0 && target.splice(idx, 1);
					} else {
						target[scope.__loopRefIndex] = inst;
					}
				}
				lastInst = inst;
			};
		}
		const propValue = buildNormalProp(schema, scope, blockScope, path, node);
		return isString(propValue)
			? buildRefProp(propValue, scope, blockScope, path, node)
			: propValue;
	};

	/**
	 * 构建属性，将整个属性 schema 转化为真实的属性值
	 * @param propsSchema - 属性 schema
	 * @param blockScope - 当前块级作用域
	 * @param extraProps - 运行时附加属性
	 */
	const buildProps = (
		propsSchema: Record<string, unknown>,
		scope: RuntimeScope,
		node?: INode | null,
		blockScope?: BlockScope | null,
		extraProps?: Record<string, unknown>
	) => {
		// 属性预处理
		const processed: Record<string, unknown> = {};
		Object.keys(propsSchema).forEach((key) => {
			processProp(processed, key, propsSchema[key]);
		});

		// 将属性 schema 转化成真实的属性值
		const parsedProps: Record<string, unknown> = {};
		const mergedScope = blockScope ? mergeScope(scope, blockScope) : scope;
		Object.keys(processed).forEach((propName) => {
			const schema = processed[propName];
			parsedProps[propName] =
				propName === 'ref'
					? buildRefProp(schema, mergedScope, blockScope, propName, node)
					: buildNormalProp(schema, mergedScope, blockScope, propName, node);
		});
		// 应用运行时附加的属性值
		if (extraProps) {
			Object.keys(extraProps).forEach((propKey) => {
				processProp(parsedProps, propKey, extraProps[propKey]);
			});
		}
		return parsedProps;
	};

	/**
	 * 构建节点的显示状态
	 * @param schema - 节点 schema
	 * @param scope - 运行时作用域
	 * @param isDesignMode - 是否为设计模式
	 * @returns 显示状态对象
	 */
	const buildShow = (
		schema: IPublicTypeNodeSchema,
		scope: RuntimeScope,
		isDesignMode: boolean
	) => {
		// 在设计模式下检查 hidden 属性,非设计模式下始终为 false
		const hidden = isDesignMode ? (schema.hidden ?? false) : false;
		// 获取条件表达式,默认为 true
		const condition = schema.condition ?? true;

		// 如果节点被隐藏,返回隐藏状态
		if (hidden) return { scene: 'hidden', show: false };

		// 返回条件渲染状态
		return {
			scene: 'condition',
			show:
				typeof condition === 'boolean'
					? condition // 如果是布尔值直接返回
					: !!parser.parseSchema(condition, scope), // 否则解析表达式并转为布尔值
		};
	};

	/**
	 * 构建所有插槽 schema，将 schema 构建成 slot 函数
	 * @param slots - 插槽 schema
	 * @param blockScope - 插槽块级作用域
	 */
	const buildSlots = (
		slots: SlotSchemaMap,
		scope: RuntimeScope,
		node?: INode | null
	) =>
		Object.keys(slots).reduce(
			(prev, next) => {
				let slotSchema = slots[next];
				const isDefaultSlot = next === 'default';

				if (isNil(slotSchema) && !isDefaultSlot) return prev;

				if (
					isDefaultSlot &&
					!node?.isContainerNode &&
					((isArray(slotSchema) && slotSchema.length === 0) ||
						isNil(slotSchema))
				)
					return prev;

				let renderSlot: Slot;

				if (isArray(slotSchema) && slotSchema.length === 0) {
					slotSchema = undefined;
				}

				if (isArray(slotSchema)) {
					renderSlot = keepParam(
						slotSchema,
						(schema) => () =>
							schema
								.map((item) => renderComp(item, scope))
								.filter((vnode): vnode is VNode => !isNil(vnode))
					);
				} else if (isSlotSchema(slotSchema)) {
					renderSlot = keepParam(
						slotSchema,
						(schema) =>
							(...args: unknown[]) => {
								const vnode = renderComp(
									schema,
									mergeScope(
										scope,
										parser.parseSlotScope(args, schema.params ?? [])
									)
								);
								return ensureArray(vnode);
							}
					);
				} else {
					renderSlot = keepParam(
						slotSchema as IPublicTypeNodeData,
						(schema) => () => ensureArray(renderComp(schema, scope))
					);
				}

				prev[next] =
					isDefaultSlot && isDesignMode && node?.isContainerNode
						? decorateDefaultSlot(renderSlot, locked) // 当节点为容器节点，且为设计模式下，则装饰默认插槽
						: renderSlot;

				return prev;
			},
			{} as Record<string, Slot>
		);

	/**
	 * 构建循环渲染相关的配置
	 * @param schema - 节点 schema
	 * @param scope - 运行时作用域
	 * @returns 循环渲染配置对象
	 */
	const buildLoop = (schema: IPublicTypeNodeSchema, scope: RuntimeScope) => {
		// 循环数据源
		let loop: IPublicTypeCompositeValue | null = null;
		// 循环参数名,默认为 ['item', 'index']
		const loopArgs = ['item', 'index'];

		// 获取循环数据源
		if (schema.loop) loop = schema.loop;
		// 获取循环参数名
		if (schema.loopArgs) {
			schema.loopArgs.forEach((v, i) => {
				v != null && v !== '' && (loopArgs[i] = v);
			});
		}
		return {
			// 解析循环数据源
			loop: loop ? parser.parseSchema(loop, scope) : null,
			loopArgs,
			/**
			 * 构建循环作用域
			 * @param item - 当前循环项
			 * @param index - 当前循环索引
			 * @param len - 循环长度
			 * @returns 循环作用域对象
			 */
			buildLoopScope(item, index, len): BlockScope {
				// 获取循环引用偏移量
				const offset = scope.__loopRefOffset ?? 0;
				const [itemKey, indexKey] = loopArgs;
				return {
					[itemKey]: item, // 当前循环项
					[indexKey]: index, // 当前循环索引
					__loopScope: true, // 标记为循环作用域
					__loopRefIndex: offset + index, // 循环引用索引
					__loopRefOffset: len * index, // 循环引用偏移量
				};
			},
		} as {
			loop: unknown;
			loopArgs: [string, string];
			buildLoopScope(item: unknown, index: number, len: number): BlockScope;
		};
	};

	const renderHoc: RenderComponent = (nodeSchema, blockScope, comp) => {
		const vnode = render(nodeSchema, Hoc, blockScope, comp);

		// 检查是否为节点 schema 且是有效的虚拟节点
		if (isNodeSchema(nodeSchema) && isVNode(vnode)) {
			// 如果节点类型是注释节点,说明节点被隐藏
			if (vnode.type === Comment) {
				// 触发节点显示状态变更回调,传入 false 表示隐藏
				onChildShowChange(nodeSchema, false);
			} else {
				// 否则节点是可见的,触发回调传入 true
				onChildShowChange(nodeSchema, true);
			}
		}
		return vnode;
	};

	/**
	 * 渲染节点vnode (live 模式)
	 * @param nodeSchema - 节点 schema
	 * @param blockScope - 节点块级作用域
	 * @param comp - 节点渲染的组件，若不传入，则根据节点的 componentName 推断
	 */
	const renderLive: RenderComponent = (nodeSchema, blockScope, comp) =>
		render(nodeSchema, Live, blockScope, comp);

	const renderComp: RenderComponent = isDesignMode ? renderHoc : renderLive;

	return {
		node,
		locked,
		getNode,
		renderComp,
		buildSlots,
		isRootNode: useIsRootNode(leafProps.__isRootNode),
	};
}

/**
 * 构建当前节点的 schema，获取 schema 的属性及插槽
 *
 * - node 的 children 会被处理成默认插槽
 * - 类型为 JSSlot 的 prop 会被处理为具名插槽
 * - prop 和 node 中同时存在 children 时，prop children 会覆盖 node children
 * - className prop 会被处理为 class prop
 */
export const buildSchema = (
	schema: IPublicTypeNodeSchema,
	node?: INode | null
) => {
	const slotProps: SlotSchemaMap = {};
	const normalProps: PropSchemaMap = {};

	// 处理节点默认插槽，可能会被属性插槽覆盖
	slotProps.default =
		isArray(schema.children) && schema.children.length === 1
			? schema.children[0]
			: schema.children;

	const normalizeSlotKey = (key: string) =>
		key === 'children' ? 'default' : key;

	Object.entries(schema.props ?? {}).forEach(([key, val]) => {
		/**
		 *  type: "JSSlot",
		 *   value: [{
		 *    componentName: "Icon",
		 *    props: { type: "star" }
		 *  }]
		 */
		if (isJSSlot(val)) {
			// 处理具名插槽
			const prop = node?.getProp(key, false);
			if (prop && prop.slotNode) {
				// design 模式，从 prop 对象到处 schema
				const slotSchema = prop.slotNode.schema;
				if (isSlotSchema(slotSchema)) {
					slotProps[normalizeSlotKey(key)] = slotSchema;
				}
			} else if (val.value) {
				// live 模式，直接获取 schema 值，若值为空则不渲染插槽
				slotProps[normalizeSlotKey(key)] = {
					componentName: 'Slot',
					params: val.params,
					children: val.value,
				};
			}
		} else if (key === 'className') {
			// 适配 react className
			normalProps.class = val;
		} else if (key === 'children') {
			// 处理属性中的默认插槽，属性的重默认插槽会覆盖节点 chilren 插槽
			slotProps.default = val;
		} else {
			// 处理普通属性
			normalProps[key] = val;
		}
	});

	return { props: normalProps, slots: slotProps };
};

export function useRenderer(rendererProps: RendererProps, scope: RuntimeScope) {
	const schemaRef = computed(() => rendererProps.__schema);
	const componentsRef = computed(() => rendererProps.__components);

	const leafProps: LeafProps = {
		__comp: null,
		__scope: scope,
		__isRootNode: true,
		__vnodeProps: {},
		__schema: rendererProps.__schema,
	};

	const designModeRef = computed(() => rendererProps.__designMode ?? 'live');

	return {
		scope,
		schemaRef,
		designModeRef,
		componentsRef,
		...useLeaf(leafProps),
	};
}

export function useRootScope(rendererProps: RendererProps, setupConext: any) {
	const {
		__schema: schema,
		__scope: extraScope,
		__parser: parser,
		__appHelper: appHelper,
		__requestHandlersMap: requestHandlersMap,
	} = rendererProps;

	// 协议中定义的参数
	const {
		props: propsSchema,
		methods: methodsSchema,
		state: stateSchema,
		lifeCycles: lifeCyclesSchema,
	} = schema ?? {};

	const instance = getCurrentInstance()!;
	const scope = instance.proxy as RuntimeScope;

	const callHook = createHookCaller(schema, scope, parser);

	callHook('initEmits');
	callHook('beforeCreate');

	// 处理 props
	callHook('initProps');
	if (propsSchema) {
		const props = parser.parseOnlyJsValue<object>(propsSchema);
		addToScope(scope, AccessTypes.PROPS, props);
	}

	const setupResult = callHook('setup', instance.props, setupConext);

	callHook('initInject');

	// 处理 methods
	if (methodsSchema) {
		const methods = parser.parseSchema(methodsSchema, scope);
		methods && addToScope(scope, AccessTypes.CONTEXT, methods);
	}

	callHook('initData');
	if (stateSchema) {
		const states = parser.parseSchema<object>(stateSchema);
		states && addToScope(scope, AccessTypes.DATA, states);
	}

	callHook('initComputed');
	callHook('initWatch');
	callHook('initProvide');

	// 处理 lifecycle
	const lifeCycles = parser.parseSchema(
		pickLifeCycles(lifeCyclesSchema),
		scope
	);
	if (Object.keys(lifeCycles).length > 0) {
		Object.keys(lifeCycles).forEach((lifeCycle) => {
			if (isLifecycleKey(lifeCycle)) {
				const callback = lifeCycles[lifeCycle];
				if (isFunction(callback)) {
					LIFT_CYCLES_MAP[lifeCycle](callback, instance);
				}
			}
		});
	}

	handleStyle(schema.css, schema.id);

	// 处理 i18n
	const i18n = (key: string, values?: any) => {
		const { __locale: locale, __messages: messages } = rendererProps;
		return getI18n(key, values, locale, messages as any);
	};

	const currentLocale = computed(() => rendererProps.__locale);
	addToScope(scope, AccessTypes.CONTEXT, { i18n, $t: i18n });
	addToScope(scope, AccessTypes.DATA, { currentLocale });

	// 处理 dataSource
	const { dataSourceMap, reloadDataSource } = create(
		schema.dataSource ?? { list: [], dataHandler: undefined },
		scope,
		requestHandlersMap
	);

	const shouldInit = () =>
		Object.keys(dataSourceMap).some((id) => toRaw(dataSourceMap[id]).isInit);

	const dataSourceData = Object.keys(dataSourceMap)
		.filter((key) => !(key in scope))
		.map((key) => [key, ref()]);
	addToScope(scope, AccessTypes.CONTEXT, {
		dataSourceMap,
		reloadDataSource,
	});

	addToScope(scope, AccessTypes.SETUP, fromPairs(dataSourceData));

	// 处理 renderer 额外传入的 scope
	if (extraScope) {
		addToScope(scope, AccessTypes.SETUP, extraScope);
	}

	callHook('created');

	const wrapRender = (render: () => VNodeChild | null) => {
		const promises: Promise<unknown>[] = [];
		isPromise(setupResult) && promises.push(setupResult);
		shouldInit() && promises.push(reloadDataSource());
		return promises.length > 0
			? Promise.all(promises).then(() => render)
			: render;
	};

	// 初始化 loop ref states
	addToScope(scope, AccessTypes.CONTEXT, {
		__loopScope: false,
		__loopRefIndex: null,
		__loopRefOffset: 0,
	});

	// 初始化 appHelper
	addToScope(
		scope,
		AccessTypes.CONTEXT,
		Object.keys(appHelper).reduce((res: Record<string, unknown>, key) => {
			const globalKey = key.startsWith('$') ? key : `$${key}`;
			res[globalKey] = appHelper[key];
			return res;
		}, {})
	);

	const unscopables = {
		_: true,
		$: true,
	};

	return {
		scope: new Proxy({} as RuntimeScope, {
			get(_, p) {
				if (p === Symbol.toStringTag) {
					return '[object RuntimeScope]';
				}
				if (p === Symbol.unscopables) {
					return unscopables;
				}
				return Reflect.get(scope, p, scope);
			},
			set(_, p, newValue) {
				return Reflect.set(scope, p, newValue, scope);
			},
			has(_, p) {
				return Reflect.has(scope, p);
			},
			defineProperty(_, property, attributes) {
				return Reflect.defineProperty(scope, property, attributes);
			},
			ownKeys: () =>
				Array.from(
					new Set([
						...Reflect.ownKeys(scope.$.props),
						...Reflect.ownKeys(scope.$.data),
						...Reflect.ownKeys((scope.$ as any).setupState),
						...Reflect.ownKeys((scope.$ as any).ctx),
					])
				),
		}),
		wrapRender,
	};
}

export function handleStyle(css: string | undefined, id: string | undefined) {
	// 处理 css
	let style: HTMLStyleElement | null = null;
	if (id) {
		style = document.querySelector(`style[data-id="${id}"]`);
	}
	if (css) {
		if (!style) {
			style = document.createElement('style');
			if (id) {
				style.setAttribute('data-id', id);
			}
			const head = document.head || document.getElementsByTagName('head')[0];
			head.appendChild(style);
		}
		if (style.innerHTML !== css) {
			style.innerHTML = css;
		}
	} else if (style) {
		style.parentElement?.removeChild(style);
	}
}

/**
 * 将协议转换为符合vue可以渲染的方式
 * 处理属性 schema，主要处理的目标：
 * - ref 逻辑 (合并 ref function)
 * - 事件绑定逻辑 (重复注册的事件转化为数组)
 * - 双向绑定逻辑 (v-model)
 * - 指令绑定逻辑
 * @param target - 组件属性目标对象
 * @param key - 属性名
 * @param val - 属性值
 */
const processProp = (
	target: Record<string, unknown>,
	key: string,
	val: unknown
) => {
	if (key.startsWith('v-model')) {
		// 双向绑定逻辑
		/**
		 * 处理 v-model 双向绑定,将 v-model 转换为 modelValue 和 onUpdate:modelValue
		 * 例如: v-model="state.count" 转换为:
		 * modelValue: state.count
		 * onUpdate:modelValue: ($event) => state.count = $event
		 */
		const matched = key.match(/v-model(?::(\w+))?$/);
		if (!matched) return target;

		const valueProp = camelCase(matched[1] ?? 'modelValue');
		const eventProp = `onUpdate:${valueProp}`;

		// 若值为表达式，则自定注册 onUpdate 事件，实现双向绑定
		if (isJSExpression(val)) {
			const updateEventFn: IPublicTypeJSFunction = {
				type: 'JSFunction',
				value: `function ($event) {${val.value} = $event}`,
			};
			target[eventProp] =
				eventProp in target
					? ensureArray(target[eventProp]).concat(updateEventFn)
					: updateEventFn;
		}
		target[valueProp] = val;
	} else if (key.startsWith('v-')) {
		// 指令绑定逻辑
	} else if (key.match(/^on[A-Z]/)) {
		// 事件绑定逻辑
		// normalize: onUpdateXxx => onUpdate:xxx
		const matched = key.match(/onUpdate(?::?(\w+))$/);
		if (matched) {
			key = `onUpdate:${camelCase(matched[1])}`;
		}

		// 若事件名称重复，则自动转化为数组
		target[key] = key in target ? ensureArray(target[key]).concat(val) : val;
	} else if (key === 'ref' && 'ref' in target) {
		// ref 合并逻辑
		const sourceRef = val;
		const targetRef = target.ref;
		if (isFunction(targetRef) && isFunction(sourceRef)) {
			target.ref = (...args: unknown[]) => {
				sourceRef(...args);
				targetRef(...args);
			};
		} else {
			target.ref = [targetRef, sourceRef].filter(isFunction).pop();
		}
	} else {
		target[key] = val;
	}
};

export const splitProps = createObjectSplitter(
	'key,ref,ref_for,ref_key,' +
		'onVnodeBeforeMount,onVnodeMounted,' +
		'onVnodeBeforeUpdate,onVnodeUpdated,' +
		'onVnodeBeforeUnmount,onVnodeUnmounted'
);

export const splitLeafProps = createObjectSplitter(leafPropKeys);

export type SlotSchemaMap = {
	[x: string]: unknown;
};

export type PropSchemaMap = {
	[x: string]: unknown;
};

const keepParam = <T, R>(param: T, cb: (param: T) => R) => cb(param);

/**
 * 装饰默认插槽，当插槽为空时，渲染插槽占位符，便于拖拽
 *
 * @param slot - 插槽渲染函数
 */
const decorateDefaultSlot =
	(slot: Slot, locked: Ref<boolean>): Slot =>
	(...args: unknown[]) => {
		const vnodes = slot(...args).filter(Boolean);
		if (!vnodes.length) {
			const isLocked = locked.value;
			const className = {
				'mtc-container-locked': isLocked,
				'mtc-container-placeholder': true,
			};
			const placeholder = isLocked
				? '该元素及其子元素已被锁定,无法进行编辑、拖拽等操作,请先解锁后再进行修改'
				: '拖拽组件或模板到这里';
			vnodes.push(h('div', { class: className }, placeholder));
		}
		return vnodes;
	};
export function isFragment(val: unknown): val is typeof Fragment {
	return val === Fragment;
}
