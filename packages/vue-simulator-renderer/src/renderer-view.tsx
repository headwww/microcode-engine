import { defineComponent, PropType, renderSlot, Suspense } from 'vue';
import { RouterView } from 'vue-router';
import MicrocodeRenderer from '@arvin-shu/microcode-renderer-core';
import { DocumentInstance, SimulatorRendererContainer } from './renderer';
import { FCell } from './test/Fc';

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
		// TODO 模拟组件库
		const components = {
			Button: defineComponent({
				props: {
					type: {
						type: String,
						default: 'primary',
					},
				},
				setup(props) {
					const typeColorMap: any = {
						primary: '#1890ff',
						success: '#52c41a',
						warning: '#faad14',
						danger: '#ff4d4f',
					};

					return () => (
						<button
							style={{
								padding: '8px 16px',
								fontSize: '14px',
								color: '#fff',
								backgroundColor: typeColorMap[props.type],
								border: 'none',
								borderRadius: '4px',
								cursor: 'pointer',
							}}
						>
							按钮
						</button>
					);
				},
			}),
			FCell,
		};
		return () => {
			const { documentInstance } = props;
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
