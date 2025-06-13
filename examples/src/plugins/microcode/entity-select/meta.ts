import { omit } from 'lodash';

export default {
	componentName: 'EntitySelect',
	title: '实体选择器',
	category: '表单',
	group: '基础组件',
	npm: {
		package: 'ArvinMicrocode',
		destructuring: true,
		exportName: 'EntitySelect',
		version: '1.0.0',
	},

	configure: {
		supports: { style: true },
		props: [
			{
				name: 'data',
				title: '数据源',
				display: 'block',
				setter: 'JsonSetter',
			},
			{
				name: 'v-model:value',
				title: '双向绑定值',
				setter: 'VariableSetter',
			},
			{
				name: 'targetClass',
				title: '目标类',
				setter: {
					componentName: 'TargetClassSetter',
				},
				extraProps: {
					supportVariable: false,
					setValue: (target: any, value: string) => {
						const columns = target.top.getPropValue('columns');

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
				name: 'placeholder',
				title: '占位符',
				propType: 'string',
				setter: 'StringSetter',
			},
			{
				name: 'path',
				title: {
					label: '字段路径',
					tip: '获取实体中的某个值使用字段路径来获取，显示在输入框中例如：a.b.c',
				},
				propType: 'string',
				setter: 'StringSetter',
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
									targetClass: target.top.getPropValue('targetClass') || '',
								},
							}),
							props: {
								config: {
									items: [
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
			{
				name: 'onCurrentRowChange',
				title: '选中事件',
				propType: 'function',
				setter: 'FunctionSetter',
			},
			{
				name: 'onClear',
				title: '清空事件',
				propType: 'function',
				setter: 'FunctionSetter',
			},
		],
	},
	snippets: [
		{
			title: '实体选择器',
			schema: {
				componentName: 'EntitySelect',
			},
		},
	],
};
