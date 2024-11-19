import * as Vue from 'vue';
import { init, plugins } from '@arvin-shu/microcode-engine';
import App from './App.vue';
import '@arvin-shu/microcode-theme/src/index.scss';
import './rest.scss';
import 'ant-design-vue/dist/reset.css';
import InitSkeleton from './plugins/plugin-init-skeleton';
import InitMaterial from './plugins/plugin-material';

// import '@arvin-shu/microcode-vue-simulator-renderer';

window.Vue = Vue;
const app = Vue.createApp(App);

await plugins.register(InitMaterial);
await plugins.register(InitSkeleton);

const preference = new Map();
preference.set('testPlungin-1', {
	scenarioName: '01010101',
});

await init(preference);

app.mount('#app');
