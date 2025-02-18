import { DatabaseOutlined } from '@ant-design/icons-vue';
import { IPublicModelPluginContext } from '@arvin-shu/microcode-types';
import { DataSourcePaneWrapper } from './pane';

const plugin = (ctx: IPublicModelPluginContext, options: any) => ({
	init() {
		options;
		const { skeleton, project } = ctx;
		skeleton.add({
			area: 'leftArea',
			name: 'dataSourcePane',
			type: 'PanelDock',
			props: {
				icon: <DatabaseOutlined />,
			},
			panelProps: {
				width: '320px',
				title: '数据源',
				hideTitleBar: true,
			},
			content: <DataSourcePaneWrapper project={project} />,
		});
	},
});

plugin.pluginName = 'DataSourcePane';

export default plugin;
