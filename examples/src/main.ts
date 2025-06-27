import * as Vue from 'vue';
import {
	init,
	plugins,
	registryInnerPlugin,
} from '@arvin-shu/microcode-engine';
import VxeUIAll from 'vxe-pc-ui';
import VxeUITable from 'vxe-table';
import InitVueCodeEditor from './plugins/ecosystem/plugin-vue-code-editor';
import PluginUndoRedo from './plugins/ecosystem/plugin-undo-redo';
import LayersPane from './plugins/ecosystem/plugin-layers-pane';
import ComponentPanelPlugin from './plugins/ecosystem/plugin-components-pane';
import DataSourcePane from './plugins/ecosystem/plugin-datasource-pane';
import App from './App.vue';
import InitSkeleton from './plugins/plugin-init-skeleton';
import InitMaterial from './plugins/plugin-material';
import InitSetter from './plugins/plugin-init-setter';
import { appHelper, createAxiosFetchHandler } from './fetch';
import VxeUIPluginRenderAntd from './vxe-antd-plugin';
import 'vxe-pc-ui/lib/style.css';
import 'vxe-table/lib/style.css';
import './mock-umd';

import './rest.scss';
import '@arvin-shu/microcode-theme/src/index.scss';
import 'ant-design-vue/dist/reset.css';
import './plugins/materials/_global';
import './plugin-render-antd.scss';
import router from './router';

window.Vue = Vue;
VxeUIAll.use(VxeUIPluginRenderAntd);
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
		// `http://127.0.0.1:8080/dist/dist/js/index.js?t=${Date.now()}`,
		// `http://192.168.1.59:8080/dist/dist/js/index.js?t=${Date.now()}`,
	],
} as any); // 引入你创建的路由实例
app.use(router);

app.mount('#app');
