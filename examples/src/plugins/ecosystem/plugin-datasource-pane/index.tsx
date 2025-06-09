import { IPublicModelPluginContext } from '@arvin-shu/microcode-types';
import { DataSourcePaneWrapper } from './pane';
import { DatabaseIcon } from './icons/database';
import { intlNode } from './locale';

const plugin = (ctx: IPublicModelPluginContext, options: any) => ({
	init() {
		options;
		const { skeleton, project } = ctx;
		const pane = skeleton.add({
			area: 'leftArea',
			name: 'dataSourcePane',
			type: 'PanelDock',
			props: {
				icon: <DatabaseIcon />,
			},
			panelProps: {
				width: '320px',
				title: intlNode('DataSource'),
				hideTitleBar: true,
			},
			content: (
				<DataSourcePaneWrapper
					skeleton={skeleton}
					project={project}
					requireConfig={options.requireConfig}
				/>
			),
		});

		ctx.project.onSimulatorRendererReady(() => {
			pane?.enable();
		});
	},
});

plugin.meta = {
	preferenceDeclaration: {
		title: '数据源面板配置',
		properties: [
			{
				key: 'requireConfig',
				type: 'object',
				description: '数据源面板配置',
			},
		],
	},
};

plugin.pluginName = 'DataSourcePane';

export default plugin;
