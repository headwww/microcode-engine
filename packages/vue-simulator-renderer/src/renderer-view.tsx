/*
 * @Author: shuwen 1243889238@qq.com
 * @Date: 2024-12-17 16:01:38
 * @LastEditors: shuwen 1243889238@qq.com
 * @LastEditTime: 2024-12-20 21:56:52
 * @FilePath: /microcode-engine/packages/vue-simulator-renderer/src/renderer-view.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
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
		documentInstance: {
			type: Object as PropType<DocumentInstance>,
			required: true,
		},
	},

	setup(props) {
		// TODO 模拟组件库
		const components = {
			Button: () => <button>按钮</button>,
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
				></MicrocodeRenderer>
			);
		};
	},
});
