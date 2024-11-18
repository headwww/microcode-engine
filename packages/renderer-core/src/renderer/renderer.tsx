import { IPublicTypeContainerSchema } from '@arvin-shu/microcode-types';
import { Component, defineComponent, PropType } from 'vue';

export const Renderer = defineComponent({
	name: 'Renderer',
	props: {
		schema: {
			type: Object as PropType<IPublicTypeContainerSchema>,
			required: true,
		},
		components: {
			type: Object as PropType<Record<string, Component>>,
			required: true,
		},
	},
	setup(props) {
		return () => {
			const { schema, components } = props;

			const renderNode = (node: IPublicTypeContainerSchema) => {
				const Comp: any = components[node.componentName];
				console.log(Comp);
				console.log(node);

				return <Comp {...node.props} />;
			};

			renderNode;
			schema;
			return <div>{renderNode(schema)}</div>;
		};
	},
});
