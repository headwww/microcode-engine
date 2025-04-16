import * as Vue from 'vue';
import {
	init,
	plugins,
	registryInnerPlugin,
} from '@arvin-shu/microcode-engine';
import InitVueCodeEditor from '@arvin-shu/microcode-plugin-vue-code-editor';
import PluginUndoRedo from '@arvin-shu/microcode-plugin-undo-redo';
import DataSourcePane from '@arvin-shu/microcode-plugin-datasource-pane';
import LayersPane from '@arvin-shu/microcode-plugin-layers-pane';
import ComponentPanelPlugin from '@arvin-shu/microcode-plugin-components-pane';
import VxeUIAll from 'vxe-pc-ui';
import VxeUITable from 'vxe-table';
import App from './App.vue';
import '@arvin-shu/microcode-theme/src/index.scss';
import './rest.scss';
import 'ant-design-vue/dist/reset.css';
import InitSkeleton from './plugins/plugin-init-skeleton';
import InitMaterial from './plugins/plugin-material';
import InitSetter from './plugins/plugin-init-setter';
import { appHelper, createAxiosFetchHandler } from './fetch';
import 'vxe-pc-ui/lib/style.css';
import 'vxe-table/lib/style.css';
import './mock-umd';

window.Vue = Vue;
const app = Vue.createApp(App).use(VxeUIAll).use(VxeUITable);

const preference = new Map();

preference.set('testPlungin-1', {
	scenarioName: '01010101',
});

registryInnerPlugin();

await plugins.register(LayersPane);
await plugins.register(ComponentPanelPlugin);
await plugins.register(InitSkeleton);
await plugins.register(InitMaterial);
await plugins.register(InitSetter);
await plugins.register(InitVueCodeEditor, {
	requireConfig: {
		paths: {
			vs: 'https://g.alicdn.com/code/lib/monaco-editor/0.33.0/min/vs',
		},
	},
});
await plugins.register(DataSourcePane, {
	requireConfig: {
		paths: {
			vs: 'https://g.alicdn.com/code/lib/monaco-editor/0.33.0/min/vs',
		},
	},
});
await plugins.register(PluginUndoRedo);

await init(preference, {
	locale: 'zh-CN',
	requestHandlersMap: {
		fetch: createAxiosFetchHandler(),
	},
	appHelper,
	supportVariableGlobally: true,
	enableCanvasLock: true,
	simulatorUrl: [
		`http://${window.location.host}/scripts/simulator/js/index.min.js`,
	],
} as any);

app.mount('#app');
