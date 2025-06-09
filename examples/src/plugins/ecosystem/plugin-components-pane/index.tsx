import { IPublicModelPluginContext } from '@arvin-shu/microcode-types';
import ComponentsPane from './pane';
import { intlNode } from './locale';
import { WidgetIcon } from './icons';

const ComponentPanelPlugin = (ctx: IPublicModelPluginContext) => ({
	init() {
		const { skeleton, project, canvas, material } = ctx;
		const componentsPane = skeleton.add({
			area: 'leftArea',
			type: 'PanelDock',
			name: 'ComponentsPane',
			panelProps: {
				title: intlNode('Components'),
			},
			content: (
				<ComponentsPane material={material} canvas={canvas}></ComponentsPane>
			),
			props: {
				align: 'top',
				icon: <WidgetIcon />,
				description: intlNode('Components'),
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
