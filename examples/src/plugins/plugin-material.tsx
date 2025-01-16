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
					configure: [
						{
							name: '#styles',
							title: {
								type: 'i18n',
								'zh-CN': '样式',
								'en-US': 'Styles',
							},
							items: [
								{
									name: 'type',
									title: {
										type: 'i18n',
										'zh-CN': '按钮类型',
										'en-US': 'Type',
									},
									setter: 'StringSetter',
									extraProps: {
										display: 'inline',
									},
								},
								{
									name: 'link',
									title: {
										label: {
											type: 'i18n',
											'zh-CN': '和上面联动',
											'en-US': 'Link to above',
										},
										tip: '测试condition',
									},
									setter: {
										componentName: 'StringSetter',
										props: {
											defaultValue: '默认值',
										},
									},
									extraProps: {
										condition: (field) =>
											field.parent.getPropValue('type') === 'primary',
									},
								},
								{
									name: 'block-01',
									title: 'block模式',
									setter: 'BoolSetter',
									extraProps: {
										display: 'block',
									},
								},
								{
									name: 'accordion-01',
									title: {
										type: 'i18n',
										'zh-CN': '默认折叠',
										'en-US': 'Style',
										description: '点击 ? tipo',
									},
									setter: 'BoolSetter',
									extraProps: {
										defaultCollapsed: true,
										display: 'accordion',
									},
								},
								{
									name: 'plain',
									title: '纯文本',
									setter: 'StringSetter',
									extraProps: {
										display: 'plain',
									},
								},
								{
									name: 'group-01',
									type: 'group',
									extraProps: {
										display: 'accordion',
									},
									items: [
										{
											name: 'type',
											setter: 'StringSetter',
										},
										{
											name: 'field-12',
											setter: 'StringSetter',
										},
									],
								},
								{
									name: 'entry-01',
									title: '入口模式=group',
									type: 'group',
									extraProps: {
										display: 'entry',
									},
									items: [
										{
											name: 'theme',
											title: '主题',
											setter: 'StringSetter',
										},
										{
											name: 'entry-02',
											title: '入口模式=group',
											type: 'group',
											extraProps: {
												display: 'entry',
											},
											items: [
												{
													name: 'theme2',
													title: '主题',
													setter: 'StringSetter',
												},
											],
										},
									],
								},
								{
									type: 'group',
									display: 'accordion',
									title: '校验2',
									items: [
										{
											type: 'group',
											display: 'popup',
											title: '非空校验',
											items: [
												{
													name: 'field-01',
													setter: 'StringSetter',
												},
												{
													type: 'group',
													display: 'popup',
													title: '非空校验01010',
													items: [
														{
															name: 'field-022',
															setter: 'StringSetter',
														},
													],
												},
											],
										},
									],
								},
							],
						},
						{
							title: {
								type: 'i18n',
								'zh-CN': '属性',
								'en-US': 'Props',
							},
							name: '#props',
							items: [],
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
									type: 'success',
								},
							},
						},
					],
				},

				{
					componentName: 'Page',
					title: 'Page',
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
								type: 'primary',
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
