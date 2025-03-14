import { IPublicModelPluginContext } from '@arvin-shu/microcode-types';
import { LtButton } from './materials/Button';
import { FCell } from './materials/FCell';
import { TestTable } from './materials/table';
import { AntdButton } from './materials/antd';

const InitMaterial = (ctx: IPublicModelPluginContext) => ({
	async init() {
		const { material, project } = ctx;

		await material.setAssets({
			version: '1.0.0',
			packages: [
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

				// {
				// 	package: 'css',
				// 	version: '1.0.0',
				// 	library: 'css',
				// 	urls: ['http://192.168.1.59:8080/dist/renderer.css'],
				// },
				{
					package: 'microcode-theme',
					version: '1.0.0',
					library: 'microcode-theme',
					urls: [
						'https://cdn.jsdelivr.net/npm/@arvin-shu/microcode-theme@1.0.0/renderer.css',
					],
				},
				{
					package: 'dayjs',
					version: '1.11.10',
					library: 'dayjs',
					urls: [
						'https://unpkg.com/dayjs@1.11.10/dayjs.min.js',
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
						'https://cdn.jsdelivr.net/npm/ant-design-vue@4.2.6/dist/antd.js',
						'https://unpkg.com/ant-design-vue@4.2.6/dist/reset.css',
					],
					library: 'antd',
				},
				{
					package: 'dayjs-init',
					library: 'dayjs-init',
					version: '1.0.0',
					urls: [
						{
							type: 'jsText',
							content: `
						  if (window.dayjs_plugin_customParseFormat) {
							dayjs.extend(window.dayjs_plugin_customParseFormat);
						  }
						  if (window.dayjs_plugin_weekday) {
							dayjs.extend(window.dayjs_plugin_weekday);
						  }
						  if (window.dayjs_plugin_localeData) {
							dayjs.extend(window.dayjs_plugin_localeData);
						  }
						  if (window.dayjs_plugin_weekOfYear) {
							dayjs.extend(window.dayjs_plugin_weekOfYear);
						  }
						  if (window.dayjs_plugin_weekYear) {
							dayjs.extend(window.dayjs_plugin_weekYear);
						  }
						  if (window.dayjs_plugin_advancedFormat) {
							dayjs.extend(window.dayjs_plugin_advancedFormat);
						  }
						  if (window.dayjs_plugin_quarterOfYear) {
							dayjs.extend(window.dayjs_plugin_quarterOfYear);
						  }
						`,
						},
					],
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
					componentName: 'LtButton',
					title: '按钮',
					configure: {
						props: [
							{
								name: 'icon',
								title: { label: '图标', tip: 'icon | 设置按钮的图标组件' },
								propType: 'node',
								setter: {
									componentName: 'SlotSetter',
									initialValue: {
										type: 'JSSlot',
										value: [
											{
												componentName: 'LtButton',
												props: {
													type: 'SmileOutlined',
													size: 20,
													rotate: 0,
													spin: false,
												},
											},
										],
									},
								},
							},
							{
								name: 'children',
								title: {
									label: '内容',
									tip: 'children | 内容',
								},
								propType: {
									type: 'oneOfType',
									value: ['node', 'string'],
								},
								setter: 'StringSetter',
							},
							// {
							// 	name: 'children',
							// 	title: {
							// 		label: '内容',
							// 		tip: 'children | 内容',
							// 	},
							// 	defaultValue: '按钮',
							// 	setter: ['StringSetter', 'VariableSetter'],
							// },
							{
								name: 'test',
								title: {
									label: {
										type: 'i18n',
										'zh-CN': '按钮类型',
										'en-US': 'Type',
									},
								},
								setter: ['StringSetter', 'VariableSetter'],
							},
							{
								name: 'type',
								title: {
									type: 'i18n',
									'zh-CN': '按钮类型',
									'en-US': 'Type',
								},
								setter: ['StringSetter', 'VariableSetter', 'BoolSetter'],
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
						advanced: {
							view: LtButton,
						},
					},

					snippets: [
						{
							title: '按钮123',
							screenshot:
								'https://alifd.oss-cn-hangzhou.aliyuncs.com/fusion-cool/icons/icon-light/ic_light_button.png',
							schema: {
								componentName: 'LtButton',
								props: {
									children: '按钮123',
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
				{
					componentName: 'Modal',
					npm: {
						package: 'antd',
						destructuring: true,
						exportName: 'Modal',
						version: '4.2.6',
					},
					configure: {
						component: {
							isModal: true,
							isContainer: true,
							rootSelector: '.ant-modal-content',
						},
					},
					snippets: [
						{
							title: '普通型',
							screenshot:
								'https://mdn.alipayobjects.com/huamei_7uahnr/afts/img/A*wM3qQ5XrhlcAAAAAAAAAAAAADrJ8AQ/original',
							schema: {
								componentName: 'Modal',
								props: {
									title: 'Basic Modal',
									okText: '确认',
									cancelText: '取消',
									open: true,
									destroyOnClose: true,
								},
								children: [],
							},
						},
					],
				},
				{
					componentName: 'Switch',
					npm: {
						package: 'antd',
						destructuring: true,
						exportName: 'Switch',
						version: '4.2.6',
					},
					props: [
						{
							name: 'loading',
							description: '加载中',
							propType: 'bool',
						},
						{
							name: 'checked',
							description: '选中',
							propType: 'bool',
						},
					],
					configure: {
						props: [
							{
								name: 'loading',
								setter: 'BoolSetter',
								defaultValue: false,
							},
							{
								name: 'checked',
								setter: 'BoolSetter',
								defaultValue: false,
							},
						],
					},
					snippets: [
						{
							title: '开关',
							screenshot:
								'https://mdn.alipayobjects.com/huamei_7uahnr/afts/img/A*rtArRpBNDZcAAAAAAAAAAAAADrJ8AQ/original',
							schema: {
								componentName: 'Switch',
							},
						},
					],
				},
				{
					componentName: 'Calendar',
					npm: {
						package: 'antd',
						destructuring: true,
						exportName: 'Calendar',
						version: '4.2.6',
					},
					props: [
						{
							name: 'fullscreen',
							description: '全屏',
							propType: 'bool',
						},
					],
					snippets: [
						{
							title: '日历',
							screenshot:
								'https://mdn.alipayobjects.com/huamei_7uahnr/afts/img/A*nF6_To7pDSAAAAAAAAAAAAAADrJ8AQ/original',
							schema: {
								componentName: 'Calendar',
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
					fileName: '/',
					id: 'node_dockcviv8fo1',
					props: {
						style: {},
					},
					state: {
						text: 'outer',
						isShowDialog: false,
						data: ['system', '123456'],
					},
					dataSource: {
						list: [
							{
								type: 'fetch',
								isInit: false,
								options: {
									method: 'POST',
									isCors: true,
									timeout: 5000,
									uri: 'ltApi/api/login',
									params: {
										type: 'JSExpression',
										value: 'this.state.$data.data',
									},
								},
								id: 'login',
								willFetch: {
									type: 'JSFunction',
									value:
										'function willFetch(options) { \n  console.log("测试",options,this)\n  return options; }',
								},
							},
							{
								type: 'fetch',
								isInit: false,
								options: {
									params: {},
									method: 'POST',
									isCors: true,
									timeout: 5000,
									headers: {},
									uri: 'https://api.github.com/users/octocat',
								},
								id: 'octocat',
							},
						],
					},
					css: 'body {\n  font-size: 12px;\n }\n\n',
					lifeCycles: {
						mounted: {
							type: 'JSFunction',
							value: "function () {\n    console.log('did mount',this);\n  }",
						},
						beforeMount: {
							type: 'JSFunction',
							value: "function () {\n    console.log('will unmount');\n  }",
						},
					},
					methods: {
						testFunc: {
							type: 'JSFunction',
							value: "function () {\n      console.log('test func');\n    }",
						},
						testFunc222: {
							type: 'JSFunction',
							value: "function () {\n      console.log('test func');\n    }",
						},
					},
					originCode: code,
					children: [
						{
							componentName: 'LtButton',
							id: 'node_sxsm4wdio232',
							props: {
								children: '按钮123',
								// children: {
								// 	type: 'JSExpression',
								// 	value: 'this.$data.text',
								// 	mock: '按钮',
								// },
								icon: {
									type: 'JSSlot',
									value: [
										{
											componentName: 'Icon',
											id: 'node_ocm7lvp0qp3',
											props: {
												type: 'SmileOutlined',
												size: 20,
												rotate: 0,
												spin: false,
											},
											hidden: false,
											title: '',
											isLocked: false,
											condition: true,
											conditionGroup: '',
										},
									],
									id: 'node_ocm7lvp0qp2',
								},
							},
							hidden: false,
							title: '',
							isLocked: false,
							condition: false,
							conditionGroup: '',
							loopArgs: null,
						},
					],
				} as any,
			],
		});

		material.loadIncrementalAssets({
			version: '',
			components: [
				{
					devMode: 'microCode',
					componentName: 'LowcodeDemo',
					title: '低代码组件示例',
					group: '低代码组件',
					schema: lowcodeSchema as any,
					snippets: [
						{
							schema: {
								componentName: 'LowcodeDemo',
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

const code = `import { defineComponent } from 'vue';

export default defineComponent({
  data: () => ({
    text: "outer",
    isShowDialog: false,
  }),		
  watch: {
    text(newValue, oldValue) {
      console.log('text changed:', oldValue, '->', newValue);
    },
  },
  methods: {
    testFunc() {
      console.log('test func');
    },
    testFunc222() {
      console.log('test func');
    },
  },
  mounted() {
    console.log('did mount', this);
  },
  beforeMount() {
    console.log('will unmount');
  },
})
`;

const lowcodeSchema = {
	version: '1.0.0',
	componentsMap: [],
	componentsTree: [
		{
			componentName: 'Component',
			id: 'node_dockcviv8f11',
			props: {
				ref: 'outerView',
				style: {
					height: '100%',
				},
			},
			docId: 'doclaqkk3b9',
			fileName: '/',
			hidden: false,
			title: '',
			isLocked: false,
			children: [
				{
					componentName: 'FCell',
					id: 'node_sxsm4wdis232',
					children: [
						{
							componentName: 'LtButton',
							id: 'node_sxsm4wdio232',
							props: {
								children: '测试按钮1',
								icon: {
									type: 'JSSlot',
									value: [
										{
											componentName: 'Icon',
											id: 'node_ocm7lvp0qp3',
											props: {
												type: 'SmileOutlined',
												size: 20,
												rotate: 0,
												spin: false,
											},
											hidden: false,
											title: '',
											isLocked: false,
										},
									],
									id: 'node_ocm7lvp0qp2',
								},
							},
							hidden: false,
							title: '',
							isLocked: false,
							loopArgs: null,
						},
						{
							componentName: 'LtButton',
							id: 'node_sxsm4wo222',
							props: {
								children: '按钮2',
								icon: {
									type: 'JSSlot',
									value: [
										{
											componentName: 'Icon',
											id: 'node_ocm7lvp0qp3',
											props: {
												type: 'SmileOutlined',
												size: 20,
												rotate: 0,
												spin: false,
											},
											hidden: false,
											title: '',
											isLocked: false,
										},
									],
									id: 'node_ocm7lvp0qp2',
								},
							},
							hidden: false,
							title: '',
							isLocked: false,
							loopArgs: null,
						},
					],
				},
			],
		},
	],
	i18n: {
		'zh-CN': {
			'i18n-jwg27yo4': '你好 ',
			'i18n-jwg27yo3': '{name} 博士',
		},
		'en-US': {
			'i18n-jwg27yo4': 'Hello ',
			'i18n-jwg27yo3': 'Doctor {name}',
		},
	},
};
