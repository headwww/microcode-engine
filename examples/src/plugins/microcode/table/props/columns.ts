import { omit } from 'lodash';

function getEntitySelectorConfig(dataConfigName: any, columnsName: any) {
	return [
		{
			name: dataConfigName,
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
									componentName: 'TextareaSetter',
								},
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
										const columns = target
											.getParent()
											.getParent()
											.getPropValue(columnsName);
										if (Array.isArray(columns)) {
											columns.forEach((column) => {
												if (column.property) {
													column.property.targetClass = value;
												}
											});

											const key = target.getParent().getParent().key;
											target.node.setPropValue(
												`columns.${key}.${columnsName}`,
												columns
											);
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
							{
								name: 'relationFunc',
								title: '关联查询',
								extraProps: {
									supportVariable: false,
								},
								setter: {
									componentName: 'FunctionSetter',
								},
							},
						],
					},
				},
			},
		},
		{
			name: columnsName,
			title: '列配置',
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
								targetClass:
									target
										.getParent()
										.getPropValue(`${dataConfigName}.targetClass`) || '',
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
													// 获取当前列的位置
													const position = target.getParent().key;

													// 获取当前列的父级的位置
													const parentPosition = target
														.getParent()
														.getParent()
														.getParent()
														.getParent()
														.getParent().key;

													const columns =
														target.top.getPropValue('columns')?.[
															parentPosition
														]?.[columnsName] || [];

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
																		'enumOptions',
																		'codeType'
																	),
																	...obj,
																	title: value.fieldTitle,
																	dataType,
																};
															}
															return column;
														}
													);
													target.node.setPropValue(
														`columns.${parentPosition}.${columnsName}`,
														newColumns
													);
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
											target.getParent().getPropValue('dataType') === 'number',
									},
									{
										name: 'boolOptions',
										title: '布尔数据',
										extraProps: {
											supportVariable: false,
										},
										condition: (target: any) =>
											target.getParent().getPropValue('dataType') === 'boolean',
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
	];
}

export default [
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
						property: {
							targetClass: target.getParent().getPropValue('targetClass'),
						},
					}),
					props: {
						config: {
							items: [
								{
									name: 'property',
									title: {
										label: '列字段',
									},
									isRequired: true,
									setter: 'PropertySetter',
									extraProps: {
										setValue: (target: any, value: any) => {
											// 根据列字段来确定数据类型和编辑类型
											if (value.topFieldTypeFlag === '1') {
												// 当选择的是实体字段的时候数据类型在实体选择器中选择
												const entitySelector = JSON.parse(
													localStorage.getItem('entity-selector-config') || '[]'
												);
												const topFieldType = value?.topFieldType;

												const entitySelectorItem = entitySelector.find(
													(item: any) => item?.targetClass === topFieldType
												);

												const tInfo = JSON.parse(entitySelectorItem.tInfo);

												// 当选择的不是实体字段的时候数据类型在文本，数字，布尔，枚举，条码中选择
												const fieldType = value?.fieldType;
												const fieldTypeFlag = value?.fieldTypeFlag;
												if (fieldTypeFlag === '2') {
													// 枚举
													const enumInfo = value?.enumInfo || [];
													const enumOptions = enumInfo?.map((item: any) => ({
														label: item.value,
														value: item.key,
													}));
													updateColumns(
														'enum',
														entitySelectorItem?.id || 'disabledEdit',
														{
															editDataConfig: tInfo?.dataConfig,
															editColumns: tInfo?.columns,
															filterDataConfig: tInfo?.dataConfig,
															filterColumns: tInfo?.columns,
															enumOptions,
														}
													);
												} else {
													switch (fieldType) {
														case 'java.lang.Integer':
															updateColumns(
																'number',
																entitySelectorItem?.id || 'disabledEdit',
																{
																	editDataConfig: tInfo?.dataConfig,
																	editColumns: tInfo?.columns,
																	filterDataConfig: tInfo?.dataConfig,
																	filterColumns: tInfo?.columns,
																	digits: 0,
																}
															);
															break;
														case 'java.lang.Long':
															updateColumns(
																'number',
																entitySelectorItem?.id || 'disabledEdit',
																{
																	editDataConfig: tInfo?.dataConfig,
																	editColumns: tInfo?.columns,
																	filterDataConfig: tInfo?.dataConfig,
																	filterColumns: tInfo?.columns,
																	digits: 0,
																}
															);
															break;
														case 'java.math.BigDecimal':
															updateColumns(
																'number',
																entitySelectorItem?.id || 'disabledEdit',
																{
																	editDataConfig: tInfo?.dataConfig,
																	editColumns: tInfo?.columns,
																	filterDataConfig: tInfo?.dataConfig,
																	filterColumns: tInfo?.columns,
																	digits: 0,
																}
															);
															break;
														case 'java.lang.Boolean':
															updateColumns(
																'boolean',
																entitySelectorItem?.id || 'disabledEdit',
																{
																	editDataConfig: tInfo?.dataConfig,
																	editColumns: tInfo?.columns,
																	filterDataConfig: tInfo?.dataConfig,
																	filterColumns: tInfo?.columns,
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
																}
															);

															break;
														case 'java.util.Date':
															updateColumns(
																'date',
																entitySelectorItem?.id || 'disabledEdit',
																{
																	editDataConfig: tInfo?.dataConfig,
																	editColumns: tInfo?.columns,
																	filterDataConfig: tInfo?.dataConfig,
																	filterColumns: tInfo?.columns,
																	dateFormatter: 'YYYY-MM-DD HH:mm:ss',
																}
															);
															break;
														default:
															updateColumns(
																'text',
																entitySelectorItem?.id || 'disabledEdit',
																{
																	editDataConfig: tInfo?.dataConfig,
																	editColumns: tInfo?.columns,
																	filterDataConfig: tInfo?.dataConfig,
																	filterColumns: tInfo?.columns,
																}
															);
															break;
													}
												}
											} else {
												// 当选择的不是实体字段的时候数据类型在文本，数字，布尔，枚举，条码中选择
												const fieldType = value?.fieldType;
												const fieldTypeFlag = value?.fieldTypeFlag;
												if (fieldTypeFlag === '2') {
													// 枚举
													const enumInfo = value?.enumInfo || [];
													const enumOptions = enumInfo?.map((item: any) => ({
														label: item.value,
														value: item.key,
													}));
													updateColumns('enum', 'select', {
														enumOptions,
													});
												} else {
													switch (fieldType) {
														case 'java.lang.Integer':
															updateColumns('number', 'number', {
																digits: 0,
															});
															break;
														case 'java.lang.Long':
															updateColumns('number', 'number', {
																digits: 0,
															});
															break;
														case 'java.math.BigDecimal':
															updateColumns('number', 'number', {
																digits: 0,
															});
															break;
														case 'java.lang.Boolean':
															updateColumns('boolean', 'boolean', {
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
															updateColumns('date', 'date', {
																dateFormatter: 'YYYY-MM-DD HH:mm:ss',
															});
															break;
														default:
															updateColumns('text', 'text');
															break;
													}
												}
											}

											function updateColumns(
												dataType: string,
												editType: string,
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
																	'enumOptions',
																	'editDataConfig',
																	'editColumns',
																	'filterDataConfig',
																	'filterColumns',
																	'codeType'
																),
																...obj,
																title: value.fieldTitle,
																dataType,
																editType,
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
									name: 'title',
									title: '列标题',
									propType: 'string',
									isRequired: true,
									setter: 'StringSetter',
								},
								{
									name: 'dataType',
									title: {
										label: '数据类型',
										tip: '渲染非编辑状态时显示的样式',
									},
									extraProps: {
										setValue: (target: any, value: any) => {
											switch (value) {
												case 'enum':
													const enumInfo =
														target.getParent().getPropValue('property')
															?.enumInfo || [];
													const enumOptions = enumInfo?.map((item: any) => ({
														label: item.value,
														value: item.key,
													}));
													updateColumns({
														enumOptions,
													});
													break;
												case 'text':
													updateColumns();
													break;
												case 'link':
													updateColumns();
													break;
												case 'number':
													updateColumns({
														digits: 0,
													});
													break;
												case 'boolean':
													updateColumns({
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
												case 'date':
													updateColumns({
														dateFormatter: 'YYYY-MM-DD HH:mm:ss',
													});
													break;
												case 'time':
													updateColumns({
														timeFormatter: 'HH:mm:ss',
													});
													break;
												case 'code':
													updateColumns({
														codeType: 'qrCode',
													});
													break;
												default:
													updateColumns();
											}
											function updateColumns(obj?: Record<string, any>) {
												const position = target.getParent().key;
												const columns = target.top.getPropValue('columns');
												const newColumns = columns.map(
													(column: any, index: number) => {
														if (index.toString() === position) {
															return {
																...omit(
																	column,
																	'dateFormatter',
																	'timeFormatter',
																	'digits',
																	'boolOptions',
																	'enumOptions',
																	'codeType',
																	'onLinkClick'
																),
																...obj,
															};
														}
														return column;
													}
												);
												target.node.setPropValue('columns', newColumns);
											}
										},
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
													title: '条码',
													value: 'code',
												},
											],
										},
									},
								},
								{
									name: 'editType',
									title: '编辑类型',
									setter: {
										componentName: 'EditTypeSetter',
										initialValue: 'text',
									},
									extraProps: {
										setValue: (target: any, value: any) => {
											if (
												[
													'disabledEdit',
													'text',
													'number',
													'boolean',
													'select',
													'date',
													'time',
												].includes(value)
											) {
												updateColumns();
											} else {
												const tInfo = JSON.parse(value?.tInfo || '{}');
												updateColumns({
													editDataConfig: tInfo?.dataConfig,
													editColumns: tInfo?.columns,
													filterDataConfig: tInfo?.dataConfig,
													filterColumns: tInfo?.columns,
												});
											}

											function updateColumns(obj?: Record<string, any>) {
												const position = target.getParent().key;
												const columns = target.top.getPropValue('columns');
												const newColumns = columns.map(
													(column: any, index: number) => {
														if (index.toString() === position) {
															return {
																...omit(
																	column,
																	'editDataConfig',
																	'editColumns',
																	'filterDataConfig',
																	'filterColumns'
																),
																...obj,
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
										target.getParent().getPropValue('dataType') === 'number',
								},
								{
									name: 'boolOptions',
									title: '布尔数据',
									condition: (target: any) =>
										target.getParent().getPropValue('dataType') === 'boolean',
									setter: {
										componentName: 'JsonSetter',
									},
								},
								{
									name: 'enumOptions',
									title: '枚举数据',
									condition: (target: any) =>
										target.getParent().getPropValue('dataType') === 'enum',
									setter: {
										componentName: 'JsonSetter',
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
									title: {
										label: '行拖拽',
										tip: '将该列设置为行拖拽的的触发列',
									},
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
								{
									name: 'onLinkClick',
									title: {
										label: '链接事件',
										tip: '当为link类型时，点击链接的回调,当列是可编辑时无法触发',
									},
									setter: 'FunctionSetter',
									condition: (target: any) =>
										target.getParent().getPropValue('dataType') === 'link',
								},
								{
									display: 'accordion',
									type: 'group',
									title: {
										label: '实体选择器设置',
										tip: '用于设置编辑和筛选的实体选择器的情况',
									},
									condition: (target: any) =>
										target.getParent().getPropValue('editType') &&
										![
											'disabledEdit',
											'select',
											'date',
											'time',
											'number',
											'text',
											'boolean',
										].includes(target.getParent().getPropValue('editType')),

									items: [
										{
											title: '编辑器配置',
											display: 'popup',
											type: 'group',
											items: [
												...getEntitySelectorConfig(
													'editDataConfig',
													'editColumns'
												),
											],
										},
										{
											title: '筛选器配置',
											display: 'popup',
											type: 'group',
											items: [
												...getEntitySelectorConfig(
													'filterDataConfig',
													'filterColumns'
												),
											],
										},
									],
								},
							],
						},
					},
				},
			},
		},
	},
];
