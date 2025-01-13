import * as Vue from 'vue';
import {
	init,
	plugins,
	registryInnerPlugin,
} from '@arvin-shu/microcode-engine';
import App from './App.vue';
import '@arvin-shu/microcode-theme/src/index.scss';
import './rest.scss';
import 'ant-design-vue/dist/reset.css';
import InitSkeleton from './plugins/plugin-init-skeleton';
import InitMaterial from './plugins/plugin-material';
import InitSetter from './plugins/plugin-init-setter';

window.Vue = Vue;
const app = Vue.createApp(App);

const preference = new Map();
preference.set('testPlungin-1', {
	scenarioName: '01010101',
});
registryInnerPlugin();
await plugins.register(InitSkeleton);
await plugins.register(InitMaterial);
await plugins.register(InitSetter);

await init(preference);

app.mount('#app');
