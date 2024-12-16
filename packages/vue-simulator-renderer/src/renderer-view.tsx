import { defineComponent, PropType, renderSlot, Suspense } from 'vue';
import { RouterView } from 'vue-router';
import { Renderer as MicrocodeRenderer } from '@arvin-shu/microcode-renderer-core';
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
		documentInstance: {
			type: Object as PropType<DocumentInstance>,
			required: true,
		},
	},

	setup(props) {
		return () => {
			const { documentInstance } = props;
			const { schema } = documentInstance;
			return <MicrocodeRenderer schema={schema}></MicrocodeRenderer>;
		};
	},
});
