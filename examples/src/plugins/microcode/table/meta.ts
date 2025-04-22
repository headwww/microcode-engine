export default {
	componentName: 'Table',
	title: '表格',
	category: '表格',
	group: '基础组件',
	npm: {
		package: 'ArvinMicrocode',
		destructuring: true,
		exportName: 'Table',
		version: '1.0.0',
	},
	configure: {
		component: { isContainer: true },
		props: [
			{
				name: 'data',
				title: '数据源',
				display: 'block',
				setter: 'JsonSetter',
			},
			{
				name: 'loading',
				title: '加载动画',
				setter: 'BoolSetter',
			},
			{
				name: 'columns',
				title: '表格列',
				setter: {
					componentName: 'ArraySetter',
					props: {
						itemSetter: {
							componentName: 'ObjectSetter',
							extraProps: {
								supportVariable: false,
							},
							initialValue: () => ({
								title: '标题',
								width: 200,
							}),
							props: {
								config: {
									items: [
										{
											name: 'title',
											title: '列标题',
											propType: 'string',
											isRequired: true,
											setter: 'StringSetter',
										},
										{
											name: 'field',
											title: '列字段',
											isRequired: true,
											propType: 'string',
											setter: 'StringSetter',
										},
										{
											name: 'dataType',
											title: {
												label: '数据类型',
												tip: '渲染非编辑状态时显示的样式',
											},
											setter: {
												componentName: 'SelectSetter',
												initialValue: 'text',
												props: {
													options: [
														{
															title: '文本',
															value: 'text',
														},
														{
															title: '链接',
															value: 'link',
														},
														{
															title: '数字',
															value: 'number',
														},
														{
															title: '布尔',
															value: 'boolean',
														},
														{
															title: '日期（年月日时分秒）',
															value: 'date',
														},
														{
															title: '时间（仅时分秒）',
															value: 'time',
														},
														{
															title: '枚举',
															value: 'enum',
														},
														{
															title: '实体',
															value: 'entity',
														},
														{
															title: '条码',
															value: 'code',
														},
													],
												},
											},
										},
										{
											name: 'editType',
											title: {
												label: '编辑类型',
												tip: '渲染编辑状态时使用的组件',
											},
											setter: {
												componentName: 'SelectSetter',
												initialValue: 'text',
												props: {
													options: [
														{
															title: '文本',
															value: 'text',
														},
														{
															title: '数字',
															value: 'number',
														},
														{
															title: '下拉选择',
															value: 'select',
														},
														{
															title: '日期选择器',
															value: 'date',
														},
														{
															title: '时间选择器',
															value: 'time',
														},
														{
															title: '布尔选择器',
															value: 'boolean',
														},
													],
												},
											},
										},
										{
											name: 'dateFormatter',
											title: '日期格式',
											condition: (target: any) =>
												target.getParent().getPropValue('dataType') === 'date',
											setter: {
												initialValue: 'YYYY-MM-DD HH:mm:ss',
												componentName: 'SelectSetter',
												props: {
													options: [
														{
															title: 'YYYY-MM-DD HH:mm:ss',
															value: 'YYYY-MM-DD HH:mm:ss',
														},
														{
															title: '年-月-日 时:分:秒',
															value: 'YYYY年MM月DD日 HH时mm分ss秒',
														},
														{
															title: 'YYYY-MM-DD HH:mm',
															value: 'YYYY-MM-DD HH:mm',
														},
														{
															title: '年-月-日 时:分',
															value: 'YYYY年MM月DD日 HH时mm分',
														},
														{
															title: 'YYYY-MM-DD HH',
															value: 'YYYY-MM-DD HH',
														},
														{
															title: '年-月-日 时',
															value: 'YYYY年MM月DD日 HH时',
														},
														{
															title: 'YYYY-MM-DD',
															value: 'YYYY-MM-DD',
														},
														{
															title: '年-月-日',
															value: 'YYYY年MM月DD日',
														},
														{
															title: 'YYYY-MM',
															value: 'YYYY-MM',
														},
														{
															title: '年-月',
															value: 'YYYY年MM月',
														},
														{
															title: 'YYYY',
															value: 'YYYY',
														},
														{
															title: '年',
															value: 'YYYY年',
														},
														{
															title: '时分秒',
															value: 'HH:mm:ss',
														},
													],
												},
											},
										},
										{
											name: 'timeFormatter',
											title: '时间格式',
											condition: (target: any) =>
												target.getParent().getPropValue('dataType') === 'time',
											setter: {
												initialValue: 'HH:mm:ss',
												componentName: 'SelectSetter',
												props: {
													options: [
														{
															title: 'HH:mm:ss',
															value: 'HH:mm:ss',
														},
														{
															title: '时分秒',
															value: 'HH时mm分ss秒',
														},
														{
															title: 'HH:mm',
															value: 'HH:mm',
														},
														{
															title: '时分',
															value: 'HH时mm分',
														},
														{
															title: 'HH',
															value: 'HH',
														},
														{
															title: '时',
															value: 'HH时',
														},
													],
												},
											},
										},
										{
											name: 'digits',
											title: {
												label: '小数位',
												tip: '保留几位小数',
											},
											setter: 'NumberSetter',
											condition: (target: any) =>
												target.getParent().getPropValue('dataType') ===
												'number',
										},
										{
											name: 'boolOptions',
											title: '布尔数据',
											condition: (target: any) =>
												target.getParent().getPropValue('dataType') ===
												'boolean',
											setter: {
												componentName: 'JsonSetter',
												initialValue: () => [
													{
														text: '是',
														value: true,
														color: 'blue',
													},
													{
														text: '否',
														value: false,
														color: 'red',
													},
												],
											},
										},
										{
											name: 'enumOptions',
											title: '枚举数据',
											condition: (target: any) =>
												target.getParent().getPropValue('dataType') === 'enum',
											setter: {
												componentName: 'JsonSetter',
												initialValue: () => [
													{
														text: '测试1',
														value: 'TEXT1',
														color: 'blue',
													},
													{
														text: '测试2',
														value: 'TEXT2',
														color: 'red',
													},
													{
														text: '测试3',
														value: 'TEXT3',
														color: 'green',
													},
												],
											},
										},
										{
											name: 'codeType',
											title: {
												label: '条码类型',
												tip: '条形码需要文本是数字的',
											},
											condition: (target: any) =>
												target.getParent().getPropValue('dataType') === 'code',
											setter: {
												initialValue: 'qrCode',
												componentName: 'SegmentedSetter',
												props: {
													options: [
														{ label: '二维码', value: 'qrCode' },
														{ label: '条形码', value: 'barCode' },
													],
												},
											},
										},
										{
											name: 'tipContent',
											title: {
												label: '提示内容',
												tip: '当鼠标悬浮在列标题上时，显示的提示内容',
											},
											setter: 'StringSetter',
										},
										{
											name: 'width',
											title: '列宽',
											setter: {
												componentName: 'NumberSetter',
												props: {
													min: 0,
												},
											},
										},
										{
											name: 'dragSort',
											title: '拖拽排序',
											setter: {
												componentName: 'BoolSetter',
											},
										},
										{
											name: 'sortable',
											title: '排序',
											setter: 'BoolSetter',
										},
										{
											name: 'fixed',
											title: '固定列',
											setter: {
												componentName: 'SelectSetter',
												props: {
													options: [
														{
															title: '不固定',
															value: '',
														},
														{
															title: '左固定',
															value: 'left',
														},
														{
															title: '右固定',
															value: 'right',
														},
													],
												},
											},
										},
									],
								},
							},
						},
					},
				},
			},
			{
				title: {
					label: '动态样式',
					tip: '当需要设置一些上下线等问题的时候可以使用该配置',
				},
				display: 'entry',
				type: 'group',
				name: 'styleConfig',
				items: [
					{
						name: 'rowStyle',
						title: '行样式',
						setter: {
							componentName: 'FunctionSetter',
						},
					},
					{
						name: 'cellStyle',
						title: '单元格样式',
						setter: {
							componentName: 'FunctionSetter',
						},
					},
				],
			},
			{
				title: {
					label: '编辑配置项',
					tip: '设置编辑的配置项',
				},
				display: 'entry',
				name: 'editConfig',
				items: [
					{
						name: 'enabled',
						title: {
							label: '是否启用',
							tip: '是否启用编辑',
						},
						setter: {
							initialValue: true,
							componentName: 'BoolSetter',
						},
					},

					{
						name: 'trigger',
						title: {
							label: '触发方式',
							tip: '分别为手动触发方式，只能用于 mode=row，click（点击触发编辑），dblclick（双击触发编辑）',
						},
						setter: {
							initialValue: 'click',
							componentName: 'SelectSetter',
							props: {
								options: [
									{
										title: '点击触发编辑',
										value: 'click',
									},
									{
										title: '手动触发编辑',
										value: 'manual',
									},
									{
										title: '双击触发编辑',
										value: 'dblclick',
									},
								],
							},
						},
					},

					{
						name: 'mode',
						title: {
							label: '编辑模式',
							tip: '编辑模式',
						},
						setter: {
							initialValue: 'cell',
							componentName: 'SegmentedSetter',
							props: {
								options: [
									{
										label: '单元格编辑',
										value: 'cell',
									},
									{
										label: '行编辑',
										value: 'row',
									},
								],
							},
						},
					},
					{
						name: 'showAsterisk',
						title: {
							label: '红色星号',
							tip: '是否显示必填字段的红色星号',
						},
						setter: {
							initialValue: true,
							componentName: 'BoolSetter',
						},
					},
					{
						name: 'showIcon',
						title: {
							label: '列头图标',
							tip: '是否显示列头编辑图标',
						},
						setter: {
							initialValue: true,
							componentName: 'BoolSetter',
						},
					},
					{
						name: 'showUpdateStatus',
						title: {
							label: '修改状态',
							tip: '是否显示单元格修改状态',
						},
						setter: {
							initialValue: true,
							componentName: 'BoolSetter',
						},
					},
					{
						name: 'showInsertStatus',
						title: {
							label: '插入状态',
							tip: '是否显示单元格插入状态',
						},
						setter: {
							initialValue: true,
							componentName: 'BoolSetter',
						},
					},
					{
						name: 'autoPos',
						title: {
							label: '自动定位',
							tip: '当单元格被激活为编辑状态时，是否自动定位',
						},
						setter: {
							initialValue: true,
							componentName: 'BoolSetter',
						},
					},
					{
						name: 'autoFocus',
						title: {
							label: '自动聚焦',
							tip: '当单元格被激活为编辑状态时，是否自动聚焦',
						},
						setter: {
							initialValue: true,
							componentName: 'BoolSetter',
						},
					},
					{
						name: 'autoClear',
						title: {
							label: '自动清除',
							tip: '当点击表格之外或者非编辑列之后，是否自动清除单元格的激活状态',
						},
						setter: {
							initialValue: true,
							componentName: 'BoolSetter',
						},
					},
				],
			},
			{
				title: '列配置信息',
				name: 'columnConfig',
				display: 'entry',
				items: [
					{
						name: 'drag',
						title: '列拖拽',
						setter: {
							initialValue: true,
							componentName: 'BoolSetter',
						},
					},
					{
						name: 'resizable',
						title: '列宽调整',
						setter: {
							initialValue: true,
							componentName: 'BoolSetter',
						},
					},
					{
						name: 'isCurrent',
						title: {
							label: '点击高亮',
							tip: '当鼠标点击列头时，是否高亮当前列',
						},
						setter: {
							initialValue: true,
							componentName: 'BoolSetter',
						},
					},
					{
						name: 'isHover',
						title: {
							label: '悬浮高亮',
							tip: '当鼠标移到列头时，是否高亮当前列',
						},
						setter: {
							initialValue: true,
							componentName: 'BoolSetter',
						},
					},
				],
			},
			{
				title: '行配置信息',
				name: 'rowConfig',
				display: 'entry',
				items: [
					{
						name: 'isCurrent',
						title: {
							label: '点击高亮',
							tip: '当鼠标点击行时，是否高亮当前行',
						},
						setter: {
							initialValue: true,
							componentName: 'BoolSetter',
						},
					},
					{
						name: 'isHover',
						title: {
							label: '悬浮高亮',
							tip: '当鼠标移到行时，是否高亮当前行',
						},
						setter: {
							initialValue: true,
							componentName: 'BoolSetter',
						},
					},
					{
						name: 'resizable',
						title: '行高调整',
						setter: {
							initialValue: true,
							componentName: 'BoolSetter',
						},
					},
					{
						name: 'drag',
						title: '拖拽',
						setter: {
							initialValue: true,
							componentName: 'BoolSetter',
						},
					},
				],
			},
			{
				title: '外观',
				display: 'entry',
				name: 'otherConfig',
				type: 'group',
				items: [
					{
						name: 'stripe',
						title: {
							label: '斑马线',
							tip: '数据行与行之间是否显示斑马线',
						},
						setter: {
							initialValue: true,
							componentName: 'BoolSetter',
						},
					},
					{
						name: 'showOverflow',
						title: {
							label: '显示溢出',
							tip: '开启后，表格文本超出会溢出模式，建议开启优化渲染性能',
						},
						setter: {
							initialValue: true,
							componentName: 'BoolSetter',
						},
					},
					{
						name: 'virtualScroll',
						title: {
							label: '虚拟滚动',
							tip: '开启后，表格会使用虚拟滚动，建议开启优化渲染性能',
						},
						setter: {
							initialValue: true,
							componentName: 'BoolSetter',
						},
						extraProps: {
							setValue: (target: any, value: string) => {
								if (value) {
									target.node.setPropValue('showOverflow', true);
								}
							},
						},
					},

					{
						name: 'round',
						title: '圆角',
						setter: {
							initialValue: true,
							componentName: 'BoolSetter',
						},
					},
					{
						name: 'border',
						title: '边框',
						setter: {
							initialValue: 'full',
							componentName: 'SelectSetter',
							props: {
								options: [
									{
										title: '默认',
										value: 'default',
									},
									{
										title: '完整边框',
										value: 'full',
									},
									{
										title: '外边框',
										value: 'outer',
									},
									{
										title: '内边框',
										value: 'inner',
									},
									{
										title: '隐藏边框',
										value: 'none',
									},
								],
							},
						},
					},

					{
						name: 'size',
						title: '尺寸',
						setter: {
							initialValue: 'mini',
							componentName: 'SegmentedSetter',
							props: {
								options: [
									{
										label: '小',
										value: 'mini',
									},
									{
										label: '中',
										value: 'medium',
									},
									{
										label: '大',
										value: 'large',
									},
								],
							},
						},
					},
					{
						name: 'align',
						title: '对齐方式',
						setter: {
							initialValue: 'left',
							componentName: 'SegmentedSetter',
							props: {
								options: [
									{
										label: '左',
										value: 'left',
									},
									{
										label: '剧中',
										value: 'center',
									},
									{
										label: '右',
										value: 'right',
									},
								],
							},
						},
					},
				],
			},
		],
	},
	snippets: [
		{
			title: '表格',
			schema: {
				componentName: 'Table',
			},
		},
	],
};
