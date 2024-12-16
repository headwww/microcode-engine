import { IPublicModelPluginContext } from '@arvin-shu/microcode-types';

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
					title: '按钮',
					props: [
						{
							name: 'type',
							title: '按钮类型',
							propType: {
								type: 'oneOfType',
								value: [
									{
										type: 'oneOf',
										value: [
											'primary',
											'ghost',
											'dashed',
											'link',
											'text',
											'default',
										],
									},
									'string',
								],
							},
						} as any,
					],
					snippets: [
						{
							title: '按钮',
							screenshot:
								'https://alifd.oss-cn-hangzhou.aliyuncs.com/fusion-cool/icons/icon-light/ic_light_button.png',
							schema: {
								componentName: 'Button',
								props: {
									type: 'primary',
								},
							},
						},
					],
				},
			],
		});
	},
});

InitMaterial.pluginName = 'InitMaterial';

export default InitMaterial;
