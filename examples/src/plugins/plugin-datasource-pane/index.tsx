import { DatabaseOutlined } from '@ant-design/icons-vue';
import { IPublicModelPluginContext } from '@arvin-shu/microcode-types';
import { DataSourcePaneWrapper } from './pane';

// TODO 数据源面板 临时使用后期还有很多优化可以做
const plugin = (ctx: IPublicModelPluginContext, options: any) => ({
	init() {
		options;
		const { skeleton, project } = ctx;
		const pane = skeleton.add({
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
			content: <DataSourcePaneWrapper skeleton={skeleton} project={project} />,
		});

		ctx.project.onSimulatorRendererReady(() => {
			pane?.enable();
		});
	},
});

plugin.pluginName = 'DataSourcePane';

export default plugin;
