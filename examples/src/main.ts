import * as Vue from 'vue';
import {
	init,
	plugins,
	registryInnerPlugin,
} from '@arvin-shu/microcode-engine';
import axios from 'axios';
import InitVueCodeEditor from '@arvin-shu/microcode-plugin-vue-code-editor';
import App from './App.vue';
import '@arvin-shu/microcode-theme/src/index.scss';
import './rest.scss';
import 'ant-design-vue/dist/reset.css';
import InitSkeleton from './plugins/plugin-init-skeleton';
import InitMaterial from './plugins/plugin-material';
import InitSetter from './plugins/plugin-init-setter';
import ComponentPanelPlugin from './plugins/plugin-components-pane';
import DataSourcePane from './plugins/plugin-datasource-pane/index';
import LayersPane from './plugins/plugin-layers-pane/index';
import PluginUndoRedo from './plugins/plugin-undo-redo/index';

window.Vue = Vue;
const app = Vue.createApp(App);

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
await plugins.register(DataSourcePane);
await plugins.register(PluginUndoRedo);
function createAxiosFetchHandler(config?: Record<string, unknown>) {
	// eslint-disable-next-line func-names
	return async function (options: any) {
		const requestConfig = {
			url: options.uri,
			method: options.method,
			data: options.params,
			headers: {
				'Content-Type': 'application/json;charset=UTF-8',
				Accept: 'application/json',
			},
		};

		config;
		const response = await axios(requestConfig as any);
		return response;
	};
}

const appHelper = {
	requestHandlersMap: {
		fetch: createAxiosFetchHandler(),
	},
};

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
