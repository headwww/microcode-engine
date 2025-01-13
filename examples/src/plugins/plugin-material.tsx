import { IPublicModelPluginContext } from '@arvin-shu/microcode-types';

const InitMaterial = (ctx: IPublicModelPluginContext) => ({
	async init() {
		const { material, project } = ctx;

		await material.setAssets({
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

				{
					package: 'css',
					version: '1.0.0',
					library: 'css',
					urls: ['http://127.0.0.1:8080/dist/renderer.css'],
				},
			],
			components: [
				{
					componentName: 'Button',
					title: '按钮',
					props: [
						{
							name: 'type',
							title: '按钮类型',
							propType: {
								type: 'oneOf',
								value: ['primary', 'ghost', 'dashed', 'danger', 'link', 'text'],
							},
							setter: 'StringSetter',
						},
					],
					configure: [
						{
							title: {
								type: 'i18n',
								'zh-CN': '属性',
								'en-US': 'Props',
							},
							name: '#props',
							items: [],
						},
						{
							name: '#styles',
							title: {
								type: 'i18n',
								'zh-CN': '样式',
								'en-US': 'Styles',
							},
							items: [
								{
									name: 'f1',
									title: {
										type: 'i18n',
										'zh-CN': '测试样式1',
										'en-US': 'Style',
									},

									setter: 'StringSetter',
									extraProps: {
										display: 'block',
									},
								},
								{
									name: 'f2',
									title: {
										type: 'i18n',
										'zh-CN': '测试样式2',
										'en-US': 'Style',
									},
									setter: 'BoolSetter',
								},
								{
									name: 'f3',
									title: {
										label: {
											type: 'i18n',
											'zh-CN': 'accordion',
											'en-US': 'Style',
										},
										tip: '点击 ? tipo',
									},
									setter: 'BoolSetter',
								},
								{
									name: 'f4',
									title: {
										type: 'i18n',
										'zh-CN': 'accordion',
										'en-US': 'Style',
										description: '点击 ? tipo',
									},
									setter: 'BoolSetter',
									extraProps: {
										display: 'accordion',
									},
								},
							],
						},
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

		project.importSchema({
			version: '1.0.0',
			id: 'nodepageshiashida',
			componentsMap: [{ componentName: 'Page', devMode: 'microCode' }],
			componentsTree: [
				{
					componentName: 'Page',
					id: 'node_dockcviv8fo1',
					props: {
						style: {
							height: '100%',
						},
					},
					fileName: '/',
					children: [
						{
							componentName: 'Button',
							id: 'node_sxsm4wdio232',
							props: {
								children: '按钮',
								bordered: true,
							},
							hidden: false,
							title: '',
							isLocked: false,
							condition: false,
							conditionGroup: '',
						},
					],
				},
			],
		});
	},
});

InitMaterial.pluginName = 'InitMaterial';

export default InitMaterial;
