import { defineComponent, PropType, renderSlot, Suspense } from 'vue';
import { RouterView } from 'vue-router';
import MicrocodeRenderer from '@arvin-shu/microcode-renderer-core';
import { DocumentInstance, SimulatorRendererContainer } from './renderer';

export const Layout = defineComponent({
	render() {
		const { $slots } = this;
		return renderSlot($slots, 'default');
	},
});

export const SimulatorRendererView = defineComponent({
	props: {
		rendererContainer: {
			type: Object as PropType<SimulatorRendererContainer>,
			required: true,
		},
	},
	setup() {
		return () => (
			<Layout>
				<RouterView>
					{{
						default: ({ Component }: { Component: any }) =>
							Component && <Suspense>{() => <Component />}</Suspense>,
					}}
				</RouterView>
			</Layout>
		);
	},
});

export const Renderer = defineComponent({
	props: {
		simulator: {
			type: Object as PropType<SimulatorRendererContainer>,
			required: true,
		},
		documentInstance: {
			type: Object as PropType<DocumentInstance>,
			required: true,
		},
	},

	setup(props) {
		return () => {
			const { documentInstance, simulator } = props;
			const { components } = simulator;
			const { schema } = documentInstance;
			return (
				<MicrocodeRenderer
					components={components}
					schema={schema}
					designMode="design"
					getNode={(id) => documentInstance.getNode(id)}
					onCompGetCtx={(schema, inst) => {
						documentInstance.mountInstance(schema.id!, inst);
					}}
				></MicrocodeRenderer>
			);
		};
	},
});
