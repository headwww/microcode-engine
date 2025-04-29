import { omit } from 'lodash';

export default {
	componentName: 'EntitySelector',
	title: '实体选择器',
	category: '其他设计器页面使用的组件',
	group: '其他',
	npm: {
		package: 'ArvinMicrocode',
		destructuring: true,
		exportName: 'EntitySelector',
		version: '1.0.0',
	},

	configure: {
		props: [
			{
				name: 'mode',
				title: {
					label: '模式',
					tip: '仅调试阶段使用，选择器模式,在筛选器中使用默认模式，在编辑框中当作弹窗使用',
				},
				extraProps: {
					supportVariable: false,
				},
				setter: {
					componentName: 'SegmentedSetter',
					initialValue: 'default',
					props: {
						options: [
							{ label: '默认', value: 'default' },
							{ label: '弹窗', value: 'popover' },
						],
					},
				},
			},
			{
				name: 'keywords',
				title: '关键词',
				extraProps: {
					supportVariable: false,
				},
				setter: {
					componentName: 'TextareaSetter',
				},
			},
			{
				name: 'dataConfig',
				title: '数据配置',
				extraProps: {
					supportVariable: false,
				},
				setter: {
					componentName: 'ObjectSetter',
					props: {
						config: {
							items: [
								{
									name: 'url',
									title: '请求地址',
									extraProps: {
										supportVariable: false,
									},
									setter: {
										initialValue:
											'api/mainProductPlanService/findMainsByPermission',
										componentName: 'TextareaSetter',
									},
								},
								{
									name: 'targetClass',
									title: '目标类',
									setter: {
										initialValue: 'lt.app.product.model.MainProductPlan',
										componentName: 'TargetClassSetter',
									},
									extraProps: {
										supportVariable: false,
										setValue: (target: any, value: string) => {
											const columns = target
												.getParent()
												.getParent()
												.getPropValue('columns');

											if (Array.isArray(columns)) {
												columns.forEach((column) => {
													if (column.property) {
														column.property.targetClass = value;
													}
												});
												target.node.setPropValue('columns', columns);
											}
										},
									},
								},
								{
									name: 'pagination',
									title: '是否分页',
									extraProps: {
										supportVariable: false,
									},
									setter: {
										componentName: 'BoolSetter',
									},
								},
								{
									name: 'method',
									title: '请求方法',
									extraProps: {
										supportVariable: false,
									},
									setter: {
										initialValue: 'POST',
										componentName: 'SelectSetter',
										props: {
											options: [
												{
													label: 'GET',
													value: 'GET',
												},
												{
													label: 'POST',
													value: 'POST',
												},
												{
													label: 'PUT',
													value: 'PUT',
												},
												{
													label: 'DELETE',
													value: 'DELETE',
												},
											],
										},
									},
								},
								{
									name: 'expressionAndOrdinalParams',
									title: {
										label: '查询语句',
										tip: '个性化处理实体选择器数据',
									},
									extraProps: {
										supportVariable: false,
									},
									setter: {
										componentName: 'ExpressionSetter',
									},
								},
							],
						},
					},
				},
			},
			{
				name: 'columns',
				title: '表格列',
				extraProps: {
					supportVariable: false,
				},
				setter: {
					componentName: 'ArraySetter',
					props: {
						itemSetter: {
							componentName: 'ObjectSetter',

							initialValue: (target: any) => ({
								title: '标题',
								width: 200,
								filterable: true,
								dataType: 'text',
								property: {
									targetClass: target
										.getParent()
										.getPropValue('dataConfig.targetClass'),
								},
							}),
							props: {
								config: {
									items: [
										{
											name: 'filterable',
											title: {
												label: '模糊查询',
												tip: '是否作为模糊查询的条件，默认当作查询条件',
											},
											extraProps: {
												supportVariable: false,
											},
											setter: {
												componentName: 'BoolSetter',
												initialValue: true,
											},
										},
										{
											name: 'title',
											title: '列标题',
											propType: 'string',
											isRequired: true,
											extraProps: {
												supportVariable: false,
											},
											setter: 'StringSetter',
										},
										{
											name: 'property',
											title: {
												label: '列字段',
											},
											isRequired: true,

											setter: 'PropertySetter',
											extraProps: {
												supportVariable: false,
												setValue: (target: any, value: any) => {
													const fieldType = value?.fieldType;
													const fieldTypeFlag = value?.fieldTypeFlag;
													if (fieldTypeFlag === '2') {
														// 枚举
														const enumInfo = value?.enumInfo || [];
														const enumOptions = enumInfo?.map((item: any) => ({
															label: item.value,
															value: item.key,
														}));
														updateColumns('enum', {
															enumOptions,
														});
													} else {
														switch (fieldType) {
															case 'java.lang.Integer':
																updateColumns('number', {
																	digits: 0,
																});
																break;
															case 'java.lang.Long':
																updateColumns('number', {
																	digits: 0,
																});
																break;
															case 'java.math.BigDecimal':
																updateColumns('number', {
																	digits: 0,
																});
																break;
															case 'java.lang.Boolean':
																updateColumns('boolean', {
																	boolOptions: [
																		{
																			label: '是',
																			value: true,
																			color: 'blue',
																		},
																		{
																			label: '否',
																			value: false,
																			color: 'red',
																		},
																	],
																});
																break;
															case 'java.util.Date':
																updateColumns('date', {
																	dateFormatter: 'YYYY-MM-DD HH:mm:ss',
																});
																break;
															default:
																updateColumns('text');
																break;
														}
													}

													function updateColumns(
														dataType: string,
														obj?: Record<string, any>
													) {
														const position = target.getParent().key;
														const columns = target.top.getPropValue('columns');
														const newColumns = columns.map(
															(column: any, index: number) => {
																if (index.toString() === position) {
																	return {
																		...omit(
																			column,
																			'dataType',
																			'dateFormatter',
																			'timeFormatter',
																			'digits',
																			'boolOptions',
																			'enumOptions'
																		),
																		...obj,
																		title: value.fieldTitle,
																		dataType,
																	};
																}
																return column;
															}
														);
														target.node.setPropValue('columns', newColumns);
													}
												},
											},
										},
										{
											name: 'dataType',
											title: {
												label: '数据类型',
												tip: '渲染非编辑状态时显示的样式',
											},
											extraProps: {
												supportVariable: false,
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
													],
												},
											},
										},
										{
											name: 'dateFormatter',
											title: '日期格式',
											extraProps: {
												supportVariable: false,
											},
											condition: (target: any) =>
												target.getParent().getPropValue('dataType') === 'date',
											setter: {
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
													],
												},
											},
										},
										{
											name: 'timeFormatter',
											title: '时间格式',
											extraProps: {
												supportVariable: false,
											},
											condition: (target: any) =>
												target.getParent().getPropValue('dataType') === 'time',
											setter: {
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
											extraProps: {
												supportVariable: false,
											},
											setter: 'NumberSetter',
											condition: (target: any) =>
												target.getParent().getPropValue('dataType') ===
												'number',
										},
										{
											name: 'boolOptions',
											title: '布尔数据',
											extraProps: {
												supportVariable: false,
											},
											condition: (target: any) =>
												target.getParent().getPropValue('dataType') ===
												'boolean',
											setter: {
												componentName: 'JsonSetter',
											},
										},
										{
											name: 'enumOptions',
											title: '枚举数据',
											extraProps: {
												supportVariable: false,
											},
											condition: (target: any) =>
												target.getParent().getPropValue('dataType') === 'enum',
											setter: {
												componentName: 'JsonSetter',
											},
										},
										{
											name: 'tipContent',
											title: {
												label: '提示内容',
												tip: '当鼠标悬浮在列标题上时，显示的提示内容',
											},
											extraProps: {
												supportVariable: false,
											},
											setter: 'StringSetter',
										},
										{
											name: 'width',
											title: '列宽',
											extraProps: {
												supportVariable: false,
											},
											setter: {
												componentName: 'NumberSetter',
												props: {
													min: 0,
												},
											},
										},
										{
											name: 'fixed',
											title: '固定列',
											extraProps: {
												supportVariable: false,
											},
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
		],
	},
	snippets: [
		{
			title: '实体选择器',
			schema: {
				componentName: 'EntitySelector',
			},
		},
	],
};
