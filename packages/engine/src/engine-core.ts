import { CiOutlined, PayCircleOutlined } from '@ant-design/icons-vue';
import {
	IMicroodePluginContextApiAssembler,
	MicrocodePluginManager,
	IMicrocodeContextPrivate,
	PluginPreference,
} from '@arvin/microcode-designer';
import {
	commonEvent,
	Editor,
	engineConfig,
	globalContext,
} from '@arvin/microcode-editor-core';
import { Skeleton, Workbench as W } from '@arvin/microcode-editor-skeleton';
import { Config, Plugins, Event } from '@arvin/microcode-shell';
import { IPublicTypePluginMeta } from '@arvin/microcode-types';
import { Logger } from '@arvin/microcode-utils';
import { Button } from 'ant-design-vue';
import { h } from 'vue';

engineConfig.set('ENGINE_VERSION', '1.0.0');

const pluginContextApiAssembler: IMicroodePluginContextApiAssembler = {
	assembleApis(
		context: IMicrocodeContextPrivate,
		pluginName: string,
		meta: IPublicTypePluginMeta
	) {
		context.plugins = plugins;
		context.config = config;
		const eventPrefix = meta?.eventPrefix || 'common';
		context.event = new Event(commonEvent, { prefix: eventPrefix });
		context.logger = new Logger({
			level: 'warn',
			bizName: `plugin:${pluginName}`,
		});
	},
};

globalContext.register({}, 'workspace');

const config = new Config(engineConfig);

const innerPlugins = new MicrocodePluginManager(pluginContextApiAssembler);

const plugins: Plugins = new Plugins(innerPlugins).toProxy();

const event = new Event(commonEvent, { prefix: 'common' });

export async function init(pluginPreference?: PluginPreference) {
	await plugins.init(pluginPreference);
}

const editor = new Editor();

const skeleton = new Skeleton(editor);

// s.add({
// 	name: 'topArea1',
// 	area: 'topArea',
// 	type: 'Widget',
// 	content: h('button', '右侧'),
// 	index: 2,
// });
// s.add({
// 	name: 'dr',
// 	area: 'topArea',
// 	contentProps: {
// 		type: 'vertical',
// 		style: {
// 			backgroundColor: '#7cb305',
// 			width: '2px',
// 			height: '20px',
// 		},
// 	},
// 	type: 'Divider',
// 	index: 1,
// });
// s.add({
// 	name: 'topArea2',
// 	area: 'topArea',
// 	type: 'Widget',
// 	content: h('div', '测试'),
// 	index: 0,
// });

// skeleton.add({
// 	name: 'topArea3',
// 	area: 'topArea',
// 	type: 'Widget',
// 	content: h(
// 		Button,
// 		{},
// 		{
// 			default: () => [h('span', 'ant按钮')],
// 		}
// 	),
// 	props: {
// 		align: 'left',
// 	},
// });

skeleton.add({
	name: 'topArea4',
	area: 'topArea',
	type: 'Widget',
	content: h(
		Button,
		{
			type: 'primary',
		},
		{
			default: () => [h('span', '保存')],
		}
	),
});

skeleton.add({
	name: 'topArea42222',
	area: 'topArea',
	type: 'PanelDock',
	props: {
		title: 'sdsa',
	},
	content: h(
		Button,
		{
			type: 'primary',
		},
		{
			default: () => [h('span', '保存')],
		}
	),
});

skeleton.add({
	name: 'sdadsa',
	area: 'topArea',
	type: 'PanelDock',
	props: {
		title: 'sdssssa',
	},
	content: h(
		Button,
		{
			type: 'primary',
		},
		{
			default: () => [h('span', '1保存')],
		}
	),
});

skeleton.add({
	name: 'topArssea4',
	area: 'toolbar',
	type: 'Widget',
	content: 'cehsi',
	props: {
		align: 'right',
	},
});

skeleton.add({
	name: 'topArss11ea4',
	area: 'toolbar',
	type: 'Widget',
	content: 'cehs11i',
});

skeleton.add({
	name: '11ea4',
	area: 'bottomArea',
	type: 'Widget',
	content: 'cehs11i',
});

skeleton.add({
	name: '11ea4-PanelDock3',
	area: 'bottomArea',
	type: 'PanelDock',
	props: {
		icon: h(PayCircleOutlined),
	},
	content: h('div', 3),
	panelProps: {
		title: '数据源',
		// hideTitleBar: true,
	},
});
// skeleton.add({
// 	name: 'topArea55',
// 	area: 'topArea',
// 	type: 'Dock',
// 	props: {
// 		title: {
// 			label: '剧中显示',
// 			// label: {
// 			// 	type: 'i18n',
// 			// 	// intl: 'hello',
// 			// 	en_US: 'Hello, world!',
// 			// 	zh_CN: '你好，世界！',
// 			// },
// 		},
// 		align: 'center',
// 		// description: {
// 		// 	type: 'i18n',
// 		// 	en_US: 'Hello, world!',
// 		// 	zh_CN: '你好，世界！',
// 		// },
// 		description: h(Button),
// 	},
// });

// skeleton.add({
// 	name: 'sdsa',
// 	area: 'topArea',
// 	type: 'PanelDock',
// 	props: { title: '测试' },
// });

skeleton.add({
	name: 'leftTest-PanelDock1',
	area: 'leftArea',
	type: 'PanelDock',
	props: {
		icon: h(CiOutlined),
	},
	panelProps: {
		title: '标题',
		description: '标题',
		help: '辅助提示文本',
	},
	content: h('div', 1),
});

skeleton.add({
	area: 'leftArea',
	type: 'PanelDock',
	name: 'test1111',
	props: {
		icon: 'CodeOutlined',
		description: '如何使111111111用',
	},
	panelProps: {
		title: {
			type: 'i18n',
			zh_CN: '组件库',
			en_US: 'zujianku',
		},
		// hideTitleBar: true,
		// help: '1321',
	},
	content: 'sdsds',
});

skeleton.add({
	name: 'leftTest-PanelDock3',
	area: 'leftArea',
	type: 'PanelDock',
	props: {
		icon: h(PayCircleOutlined),
	},
	content: h('div', 3),
	panelProps: {
		title: '数据源',
		// hideTitleBar: true,
	},
});

const Workbench = h(W, {
	skeleton,
});
export { plugins, config, event, Workbench };
