/*
 * @Author: shuwen 1243889238@qq.com
 * @Date: 2024-11-04 09:56:33
 * @LastEditors: shuwen 1243889238@qq.com
 * @LastEditTime: 2024-11-14 16:12:17
 * @FilePath: /microcode-engine/examples/src/plugins/plugin-material.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
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
