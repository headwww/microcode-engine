import { PartitionOutlined } from '@ant-design/icons-vue';
import { IPublicModelPluginContext } from '@arvin-shu/microcode-types';
import { LayersPane } from './pane';

const plugin = (ctx: IPublicModelPluginContext) => ({
	init() {
		const { skeleton } = ctx;
		skeleton.add({
			area: 'leftArea',
			name: 'layersPane',
			type: 'PanelDock',
			index: -1,
			props: {
				icon: <PartitionOutlined />,
			},
			panelProps: {
				width: '320px',
				title: '布局图层',
			},
			content: <LayersPane />,
		});
	},
});

plugin.pluginName = 'LayersPane';

export default plugin;
