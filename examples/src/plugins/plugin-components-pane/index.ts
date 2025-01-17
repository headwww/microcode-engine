import { BuildOutlined } from '@ant-design/icons-vue';
import { IPublicModelPluginContext } from '@arvin-shu/microcode-types';
import { h } from 'vue';
import ComponentsPane from './pane';

const ComponentPanelPlugin = (ctx: IPublicModelPluginContext) => ({
	init() {
		const { skeleton, project } = ctx;
		const componentsPane = skeleton.add({
			area: 'leftArea',
			type: 'PanelDock',
			name: 'ComponentsPane',
			panelProps: {
				title: '组件库',
			},
			content: h(ComponentsPane),
			props: {
				align: 'top',
				icon: h(BuildOutlined),
				description: '组件库',
			},
		});
		componentsPane?.disable?.();
		project.onSimulatorRendererReady(() => {
			componentsPane?.enable?.();
		});
	},
});

ComponentPanelPlugin.pluginName = 'ComponentPanelPlugin';

export default ComponentPanelPlugin;
