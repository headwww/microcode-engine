import { IPublicModelPluginContext } from '@arvin/microcode-types';

const InitMaterial = (ctx: IPublicModelPluginContext) => ({
	async init() {
		const { material } = ctx;
		material.setAssets({
			version: '1.0.0',
			packages: [
				{
					package: 'moment',
					version: '2.24.0',
					urls: ['https://g.alicdn.com/mylib/moment/2.24.0/min/moment.min.js'],
					library: 'moment',
				},
				{
					package: 'lodash',
					library: '_',
					version: '4.6.1',
					urls: ['https://g.alicdn.com/platform/c/lodash/4.6.1/lodash.min.js'],
				},
			],
			components: [
				{
					componentName: 'button',
				},
			],
		});
	},
});

InitMaterial.pluginName = 'InitMaterial';

export default InitMaterial;
