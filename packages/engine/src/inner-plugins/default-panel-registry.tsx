import { IPublicModelPluginContext } from '@arvin/microcode-types';
import { DesignerPlugin } from './designer-plugin';

// 注册默认的面板
export const defaultPanelRegistry = (editor: any) => {
	const fun = (ctx: IPublicModelPluginContext) => ({
		init() {
			const { skeleton, config } = ctx;
			skeleton.add({
				area: 'mainArea',
				name: 'designer',
				type: 'Widget',
				content: (
					<DesignerPlugin
						engineConfig={config}
						engineEditor={editor}
					></DesignerPlugin>
				),
			});
		},
	});

	fun.pluginName = '___default_panel___';

	return fun;
};

export default defaultPanelRegistry;
