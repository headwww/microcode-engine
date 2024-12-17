import {
	IPublicTypeNodeSchema,
	IPublicTypeRootSchema,
} from '@arvin-shu/microcode-types';
import {
	Component,
	computed,
	defineComponent,
	h,
	PropType,
	reactive,
	shallowRef,
	watch,
} from 'vue';
import config from './config';

const rendererProps = {
	schema: {
		type: Object as PropType<IPublicTypeRootSchema | IPublicTypeNodeSchema>,
		required: true,
	},
	components: {
		type: Object as PropType<Record<string, Component>>,
		required: true,
	},
	/** 设备信息 */
	device: String,
	/** 语言 */
	locale: String,
} as const;

export const Renderer = defineComponent({
	name: 'Renderer',
	props: rendererProps,
	setup(props, { slots }) {
		const schemaRef = shallowRef(props.schema);

		watch(
			() => props.schema,
			() => {
				schemaRef.value = props.schema;
			}
		);

		const rendererContext = reactive({
			components: computed(() => ({
				...config.getRenderers(),
			})),
		});

		const renderContent = () => {
			const { components } = rendererContext;
			const { value: schema } = schemaRef;
			if (!schema) return null;
			const { componentName } = schema;
			const Comp =
				components[componentName] || components[`${componentName}Renderer`];

			return Comp
				? h(
						Comp,
						{
							__schema: schema,
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
