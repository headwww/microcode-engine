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

export const Renderer = defineComponent({
	name: 'Renderer',
	props: {
		schema: {
			type: Object as PropType<IPublicTypeRootSchema | IPublicTypeNodeSchema>,
		},
		components: {
			type: Object as PropType<Record<string, Component>>,
		},
	},
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

			return Comp ? h(Comp, {}, slots) : null;
		};

		return () => renderContent();
	},
});
