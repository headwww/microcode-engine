import { IPublicModelPluginContext } from '@arvin-shu/microcode-types';
import { SettingsPrimaryPane } from '@arvin-shu/microcode-editor-skeleton';
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

			// TODO disableDefaultSettingPanel
			skeleton.add({
				area: 'rightArea',
				name: 'settingsPane',
				type: 'Panel',
				content: (
					<SettingsPrimaryPane engineEditor={editor}></SettingsPrimaryPane>
				),
			});
		},
	});

	fun.pluginName = '___default_panel___';

	return fun;
};
