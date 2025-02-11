import { defineComponent, h, PropType, renderSlot, Suspense } from 'vue';
import { RouterView } from 'vue-router';
import MicrocodeRenderer from '@arvin-shu/microcode-renderer-core';
import { DocumentInstance, SimulatorRendererContainer } from './renderer';

export const Layout = defineComponent({
	props: {
		rendererContainer: {
			type: Object as PropType<SimulatorRendererContainer>,
			required: true,
		},
	},
	render() {
		const { $slots, rendererContainer } = this;
		const { layout, getComponent } = rendererContainer;
		if (layout.value) {
			const { Component, props = {}, componentName } = layout.value;
			if (Component) {
				return h(
					Component,
					{ ...props, key: 'layout', rendererContainer } as any,
					$slots
				);
			}
			const ComputedComponent = componentName && getComponent(componentName);
			if (ComputedComponent) {
				return h(
					ComputedComponent,
					{ ...props, key: 'layout', rendererContainer },
					$slots
				);
			}
		}
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
	setup(props) {
		return () => (
			<Layout rendererContainer={props.rendererContainer}>
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
			const { schema, key, container } = documentInstance;
			const {
				designMode,
				device,
				locale,
				components,
				requestHandlersMap,
				thisRequiredInJSE,
			} = simulator;

			const messages = container.context?.utils?.i18n?.messages || {};

			return (
				<MicrocodeRenderer
					key={key}
					locale={locale.value}
					messages={messages}
					schema={schema}
					appHelper={container.context.value}
					designMode={designMode.value}
					device={device.value}
					scope={{}}
					components={components}
					requestHandlersMap={requestHandlersMap.value}
					thisRequiredInJSE={thisRequiredInJSE.value}
					getNode={(id) => documentInstance.getNode(id)}
					onCompGetCtx={(schema, inst) => {
						documentInstance.mountInstance(schema.id!, inst);
					}}
				></MicrocodeRenderer>
			);
		};
	},
});
