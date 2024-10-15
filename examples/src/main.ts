import { createApp } from 'vue';
import { plugins } from '@arvin/microcode-engine';
import {
	IPublicModelPluginContext,
	IPublicTypePluginConfig,
} from '@arvin/microcode-types';
import { getLogger } from '@arvin/microcode-utils';
import App from './App.vue';

const app = createApp(App);

app.mount('#app');

const logger = getLogger({ level: 'log', bizName: 'main' });

const testPlungin = (
	ctx: IPublicModelPluginContext,
	options: any
): IPublicTypePluginConfig => ({
	init() {
		logger.info('init');
		logger.info(ctx, options);
	},
	destroy() {
		logger.info('destroy');
	},
	exports() {
		logger.info('exports');
	},
});
testPlungin.pluginName = 'testPlungin-1';

const testPlungin1 = (
	ctx: IPublicModelPluginContext,
	options: any
): IPublicTypePluginConfig => ({
	init() {
		logger.info('init');
		logger.info(ctx, options);
	},
	destroy() {
		logger.info('destroy');
	},
	exports() {
		logger.info('exports');
	},
});

testPlungin1.pluginName = 'testPlungin-2';

plugins.register(testPlungin);

plugins.register(testPlungin1);

const preference = new Map();

preference.set('EditorInitPlugin', {
	theme: '1111',
});

plugins.init(preference);
