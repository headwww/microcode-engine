import { createApp } from 'vue';
import { init, plugins } from '@arvin/microcode-engine';
import {
	IPublicModelPluginContext,
	IPublicTypePluginConfig,
} from '@arvin/microcode-types';
import { getLogger } from '@arvin/microcode-utils';
import App from './App.vue';
import '@arvin/microcode-theme/src/index.scss';
import './a.scss';
import 'ant-design-vue/dist/reset.css';

const app = createApp(App);

app.mount('#app');

const logger = getLogger({ level: 'log', bizName: 'main' });

const testPlungin = (
	ctx: IPublicModelPluginContext,
	options: any
): IPublicTypePluginConfig => ({
	init() {
		ctx;
		options;
		// logger.info('init');
		// logger.info(ctx.preference.getPreferenceValue('scenarioName'), options);
		// logger.info(ctx, options);
	},
	destroy() {
		logger.info('destroy');
	},
	exports() {
		logger.info('exports');
	},
});
testPlungin.pluginName = 'testPlungin-1';
testPlungin.meta = {
	preferenceDeclaration: {
		title: '保存插件配置',
		properties: [
			{
				key: 'scenarioName',
				type: 'string',
				description: '用于localstorage存储key',
			},
		],
	},
};

// const testPlungin1 = (
// 	ctx: IPublicModelPluginContext,
// 	options: any
// ): IPublicTypePluginConfig => ({
// 	init() {
// 		logger.info('init');
// 		logger.info(ctx, options);
// 	},
// 	destroy() {
// 		logger.info('destroy');
// 	},
// 	exports() {
// 		logger.info('exports');
// 	},
// });

// testPlungin1.pluginName = 'testPlungin-2';

plugins.register(testPlungin);

// plugins.register(testPlungin1);

const preference = new Map();

preference.set('testPlungin-1', {
	scenarioName: '01010101',
});

init(preference);

// const preference = new Map();

// preference.set('EditorInitPlugin', {
// 	theme: '1111',
// });

// plugins.init(preference);
