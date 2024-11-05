import { IPublicModelPluginContext } from '@arvin/microcode-types';

const InitMaterial = (ctx: IPublicModelPluginContext) => ({
	async init() {
		const { material } = ctx;
		material.setAssets({
			version: '1.0.0',
			components: [
				{
					componentName: 'button',
				},
				// {
				// 	exportName: 'AlilcLowcodeMaterialsMeta',
				// 	npm: {
				// 		package: '@alilc/lowcode-materials',
				// 	},
				// 	url: 'http://192.168.1.59:8080/index1.js',
				// 	urls: {
				// 		default:
				// 			'https://alifd.alicdn.com/npm/@alilc/lowcode-materials@1.0.7/build/lowcode/meta.js',
				// 		design:
				// 			'https://alifd.alicdn.com/npm/@alilc/lowcode-materials@1.0.7/build/lowcode/meta.design.js',
				// 	},
				// },
				// {
				// 	exportName: 'Test1',
				// 	npm: {
				// 		package: '@alilc/Test2',
				// 	},
				// 	url: {
				// 		id: 'chaojis',
				// 		type: 'cssUrl',
				// 		content:
				// 			'https://cdn.jsdelivr.net/npm/ant-design-vue@4.2.5/dist/reset.min.css',
				// 	},
				// },
			],
		});
	},
});

InitMaterial.pluginName = 'InitMaterial';

export default InitMaterial;
