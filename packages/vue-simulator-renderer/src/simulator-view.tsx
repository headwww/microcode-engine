import { defineComponent, h, PropType, ref, renderSlot, Suspense } from 'vue';
import { RouterView } from 'vue-router';
import MicrocodeRenderer from '@arvin-shu/microcode-renderer-core';

export const Layout = defineComponent({
	props: {
		rendererContainer: {
			type: Object as PropType<any>,
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
			type: Object as PropType<any>,
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
			type: Object as PropType<any>,
			required: true,
		},
		documentInstance: {
			type: Object as PropType<any>,
			required: true,
		},
	},

	setup: () => ({ renderer: ref() }),

	render() {
		const { documentInstance, simulator } = this;
		const { scope, key, appHelper, messages, schema } = documentInstance;
		const {
			designMode,
			device,
			locale,
			components,
			requestHandlersMap,
			thisRequiredInJSE,
			disableCompMock,
		} = simulator;

		return (
			<MicrocodeRenderer
				key={key}
				locale={locale}
				messages={messages}
				schema={schema}
				appHelper={appHelper}
				designMode={designMode}
				device={device}
				scope={scope}
				components={components}
				requestHandlersMap={requestHandlersMap}
				disableCompMock={disableCompMock}
				thisRequiredInJSE={thisRequiredInJSE}
				getNode={(id: any) => documentInstance.getNode(id)}
				onCompGetCtx={(schema: any, inst: any) => {
					documentInstance.mountInstance(schema.id!, inst);
				}}
			></MicrocodeRenderer>
		);
	},
});
