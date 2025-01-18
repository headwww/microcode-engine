import { IPublicModelPluginContext } from '@arvin-shu/microcode-types';
import { TestButton } from './materials/Button';
import { FCell } from './materials/FCell';
import { TestTable } from './materials/table';
import { AntdButton } from './materials/antd';

const InitMaterial = (ctx: IPublicModelPluginContext) => ({
	async init() {
		const { material, project } = ctx;

		await material.setAssets({
			version: '1.0.0',
			packages: [
				// {
				// 	package: 'dayjs',
				// 	version: '1.11.10',
				// 	library: 'dayjs',
				// 	urls: ['https://unpkg.com/dayjs/dayjs.min.js'],
				// },
				// {
				// 	package: 'ant-design-vue',
				// 	version: '4.2.6',
				// 	urls: [
				// 		'https://cdn.jsdelivr.net/npm/ant-design-vue@4.2.6/dist/antd.min.js',
				// 	],
				// 	library: 'ant-design-vue',
				// },

				{
					package: 'xe-utils',
					library: 'XEUtils',
					version: '3.5.32',
					urls: [
						'https://cdn.jsdelivr.net/npm/xe-utils@3.5.32/dist/xe-utils.umd.min.js',
					],
				},
				{
					package: 'VxeUi',
					library: 'VxeUi',
					version: '4.3.16',
					urls: [
						'https://cdn.jsdelivr.net/npm/vxe-pc-ui@4.3.16/lib/index.umd.min.js',
						'https://cdn.jsdelivr.net/npm/vxe-pc-ui@4.3.16/lib/style.min.css',
					],
				},
				{
					package: 'vxe-table',
					library: 'VXETable',
					version: '4.9.15',
					urls: [
						'https://cdn.jsdelivr.net/npm/vxe-table@4.9.15/lib/index.umd.min.js',
						'https://cdn.jsdelivr.net/npm/vxe-table@4.9.15/lib/style.min.css',
					],
				},

				{
					package: 'element-plus',
					library: 'element-plus',
					version: '2.4.1',
					urls: [
						'https://unpkg.com/element-plus/dist/index.css',
						'https://unpkg.com/element-plus',
					],
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
					urls: ['http://192.168.1.59:8080/dist/renderer.css'],
				},
				{
					package: 'dayjs',
					version: '1.11.10',
					library: 'dayjs',
					urls: [
						'https://unpkg.com/dayjs/dayjs.min.js',
						'https://unpkg.com/dayjs/plugin/customParseFormat.js',
						'https://unpkg.com/dayjs/plugin/weekday.js',
						'https://unpkg.com/dayjs/plugin/localeData.js',
						'https://unpkg.com/dayjs/plugin/weekOfYear.js',
						'https://unpkg.com/dayjs/plugin/weekYear.js',
						'https://unpkg.com/dayjs/plugin/advancedFormat.js',
						'https://unpkg.com/dayjs/plugin/quarterOfYear.js',
					],
				},
				{
					package: 'antd',
					version: '4.2.6',
					urls: [
						'https://unpkg.com/browse/ant-design-vue@4.2.6/dist/antd.min.js',
						'https://unpkg.com/browse/ant-design-vue@4.2.6/dist/reset.css',
					],
					library: 'antd',
				},
			],
			components: [
				{
					componentName: 'FCell',
					title: '容器',
					configure: {
						component: {
							isContainer: true,
						},
						advanced: {
							view: FCell,
						},
					},
					snippets: [
						{
							title: '容器',
							screenshot:
								'https://img.alicdn.com/imgextra/i2/O1CN01B1NMW926IFrFxjqQT_!!6000000007638-55-tps-56-56.svg',
							schema: {
								componentName: 'FCell',
							},
						},
					],
				},
				{
					componentName: 'TestTable',
					title: '表格',
					configure: {
						component: {
							// isContainer: true,
						},
						advanced: {
							view: TestTable,
						},
						props: [
							{
								name: '#styles',
								title: {
									type: 'i18n',
									'zh-CN': '样式',
									'en-US': 'Styles',
								},
								items: [
									{
										name: 'title',
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
										},
									},
								],
							},
						],
					},
					snippets: [
						{
							title: '表格',
							screenshot:
								'https://gw.alipayobjects.com/zos/alicdn/f-SbcX2Lx/Table.svg',
							schema: {
								componentName: 'TestTable',
							},
						},
					],
				},
				{
					componentName: 'TestButton',
					title: '按钮',
					configure: {
						props: [
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
										name: 'title',
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
						advanced: {
							view: TestButton,
						},
					},

					snippets: [
						{
							title: '按钮',
							screenshot:
								'https://alifd.oss-cn-hangzhou.aliyuncs.com/fusion-cool/icons/icon-light/ic_light_button.png',
							schema: {
								componentName: 'TestButton',
								props: {
									type: 'success',
								},
							},
						},
					],
				},
				{
					componentName: 'AntdButton',
					title: 'antd按钮',
					configure: {
						advanced: {
							view: AntdButton,
						},
					},
					snippets: [
						{
							title: '按钮123',
							screenshot:
								'https://mdn.alipayobjects.com/huamei_7uahnr/afts/img/A*BrFMQ5s7AAQAAAAAAAAAAAAADrJ8AQ/original',
							schema: {
								componentName: 'AntdButton',
								props: {
									type: 'success',
								},
							},
						},
					],
				},
			],
		});

		project.importSchema({
			version: '1.0.0',
			id: 'node_pagetest0809a',
			componentsMap: [{ componentName: 'Page', devMode: 'microCode' }],
			componentsTree: [
				{
					componentName: 'Page',
					id: 'node_dockcviv8fo1',
					props: {
						ref: 'outerView',
						style: {
							height: '100%',
						},
					},
					fileName: '/',
					children: [
						{
							componentName: 'TestButton',
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
