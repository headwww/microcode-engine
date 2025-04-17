import {
	I18nMessages,
	IPublicTypeContainerSchema,
	IPublicTypeNodeSchema,
} from '@arvin-shu/microcode-types';
import {
	Component,
	ComponentPublicInstance,
	computed,
	defineComponent,
	h,
	PropType,
	provide,
	reactive,
	ref,
	shallowRef,
	watch,
	watchEffect,
	triggerRef,
} from 'vue';
import { INode } from '@arvin-shu/microcode-designer';
import config from './config';
import { DesignMode, getRendererContextKey } from './core';
import {
	BlockScope,
	createObjectSplitter,
	debounce,
	exportSchema,
	isBoolean,
	RuntimeScope,
	SchemaParser,
} from './utils';
import { RENDERER_COMPS } from './renderers';

const rendererProps = {
	scope: {
		type: Object as PropType<BlockScope>,
	},
	schema: {
		type: Object as PropType<IPublicTypeContainerSchema>,
		required: true,
	},
	passProps: Object as PropType<Record<string, unknown>>,
	components: {
		type: Object as PropType<Record<string, Component>>,
		required: true,
	},
	designMode: {
		type: String as PropType<DesignMode>,
		default: 'live',
	},
	/** 设备信息 */
	device: String,
	/** 语言 */
	locale: String,
	messages: {
		type: Object as PropType<I18nMessages>,
		default: () => ({}),
	},
	/** 组件获取 ref 时触发的钩子 */
	onCompGetCtx: Function as PropType<
		(schema: IPublicTypeNodeSchema, ref: ComponentPublicInstance) => void
	>,
	/** 是否只支持使用 this 来访问上下文变量 */
	thisRequiredInJSE: {
		type: Boolean,
		default: true,
	},

	disableCompMock: {
		type: [Array, Boolean] as PropType<string[] | boolean>,
		default: false,
	},
	getNode: Function as PropType<(id: string) => INode | null>,
	/** 主要用于设置渲染模块的全局上下文，里面定义的内容可以在低代码中通过 this 来访问，比如 this.utils */
	appHelper: Object,

	requestHandlersMap: Object,
} as const;

/** 是否是异步组件 */
const isAsyncComp = (comp: any) =>
	comp && comp.name === 'AsyncComponentWrapper';

const splitOptions = createObjectSplitter(
	(prop) => !prop.match(/^[a-z]+([A-Z][a-z]+)*$/)
);

export const Renderer = defineComponent({
	props: rendererProps,
	setup(props, { slots, expose }) {
		const parser = new SchemaParser({
			thisRequired: props.thisRequiredInJSE,
		}).initModule(props.schema);

		const schemaRef = shallowRef(props.schema);

		const getNode = (id: string) => props.getNode?.(id) ?? null;

		const triggerCompGetCtx = (
			schema: IPublicTypeNodeSchema,
			val: ComponentPublicInstance
		) => {
			val && props.onCompGetCtx?.(schema, val);
		};

		watch(
			() => props.schema,
			() => {
				schemaRef.value = props.schema;
			}
		);

		let needWrapComp: (name: string) => boolean = () => true;

		watchEffect(() => {
			const { disableCompMock } = props;
			if (isBoolean(disableCompMock)) {
				needWrapComp = disableCompMock ? () => false : () => true;
			} else if (disableCompMock) {
				needWrapComp = (name) => !disableCompMock.includes(name);
			}
		});

		const wrapCached: Map<object, Map<object, any>> = new Map();

		const rendererContext = reactive({
			designMode: computed(() => props.designMode),
			components: computed(() => ({
				...config.getRenderers(),
				...props.components,
			})),
			thisRequiredInJSE: computed(() => props.thisRequiredInJSE),
			getNode: (id: string) => (props.getNode?.(id) as any) ?? null,
			triggerCompGetCtx: (
				schema: IPublicTypeNodeSchema,
				inst: ComponentPublicInstance
			) => {
				props.onCompGetCtx?.(schema, inst);
			},
			rerender: debounce(() => {
				const { id } = props.schema;
				const node = id && getNode(id);
				if (node) {
					const newSchema = exportSchema<IPublicTypeContainerSchema>(node);
					if (newSchema) {
						schemaRef.value = newSchema;
					}
				}
				triggerRef(schemaRef);
			}),
			wrapLeafComp: <T extends object, L extends object>(
				name: string,
				comp: T,
				leaf: L
			): L => {
				let record = wrapCached.get(leaf);
				if (record) {
					if (record.has(comp)) {
						return record.get(comp);
					}
				} else {
					record = new Map();
					wrapCached.set(leaf, record);
				}
				if (needWrapComp(name) && !isAsyncComp(comp)) {
					// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
					const [privateOptions, _, privateOptionsCount] = splitOptions(
						comp as any
					);
					if (privateOptionsCount) {
						leaf = Object.create(
							leaf,
							Object.getOwnPropertyDescriptors(privateOptions)
						);
					}
				}
				record.set(comp, leaf);
				return leaf;
			},
		});

		provide(getRendererContextKey(), rendererContext);

		const runtimeScope = ref<RuntimeScope>();

		expose({ runtimeScope });

		const renderContent = () => {
			const { components } = rendererContext;
			const {
				scope,
				locale,
				messages,
				designMode,
				thisRequiredInJSE,
				requestHandlersMap,
				passProps,
				appHelper,
			} = props;
			const { value: schema } = schemaRef;

			if (!schema) return null;

			const { componentName } = schema;
			let Comp =
				components[componentName] || components[`${componentName}Renderer`];
			if (Comp && !(Comp as any).__renderer__) {
				Comp = RENDERER_COMPS[`${componentName}Renderer`];
			}
			return Comp
				? h(
						Comp,
						{
							ref: runtimeScope,
							key: schema.__ctx
								? `${schema.__ctx.mtcKey}_${schema.__ctx.idx || '0'}`
								: schema.id,
							...passProps,
							...parser.parseOnlyJsValue(schema.props),
							__parser: parser,
							__scope: scope,
							__schema: schema,
							__locale: locale,
							__messages: messages,
							__appHelper: appHelper,
							__components: components,
							__designMode: designMode,
							__thisRequiredInJSE: thisRequiredInJSE,
							__requestHandlersMap: requestHandlersMap,
							__getNode: getNode,
							__triggerCompGetCtx: triggerCompGetCtx,
						},
						slots
					)
				: null;
		};

		return () => {
			const { device, locale } = props;
			const configProvider = config.getConfigProvider();
			return configProvider
				? h(
						configProvider,
						{
							device,
							locale,
						},
						{
							default: renderContent,
						}
					)
				: renderContent();
		};
	},
});
