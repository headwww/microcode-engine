import { cloneDeep, get, omit, set } from 'lodash';

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
														target.top.getPropValue('formTabs')?.[
															parentPosition
														]?.[columnsName] || [];

													const newColumns = columns.map(
														(column: any, index: number) => {
															if (index.toString() === position) {
																return {
																	...omit(
																		column,
																		'dataType',
																		'isTextarea',
																		'codeSize',
																		'showCodeValue',
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
														`formTabs.${parentPosition}.${columnsName}`,
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
		title: '表单配置',
		display: 'entry',
		type: 'group',
		items: [
			{
				name: 'formTabs',
				title: '标签',
				extraProps: {
					supportVariable: false,
				},
				setter: {
					componentName: 'ArraySetter',
					props: {
						itemSetter: {
							componentName: 'ObjectSetter',
							initialValue: (target: any) => {
								let guid = Date.now();
								function uniqueId(prefix = '') {
									return `${prefix}${(guid++).toString(36).toLowerCase()}`;
								}
								const index = target.top.getPropValue('formTabs')?.length || 0;

								return {
									title: `表单${index + 1}`,
									id: uniqueId('lt_tab_key_'),
								};
							},
							props: {
								config: {
									items: [
										{
											name: 'title',
											title: {
												label: '标题',
											},
											isRequired: true,
											setter: 'StringSetter',
										},
										{
											name: 'formItems',
											title: '表单项',
											extraProps: {
												supportVariable: false,
											},
											setter: {
												componentName: 'TreeArraySetter',
												props: {
													pathSegmentCount: 3,
													groupSetter: {
														componentName: 'ObjectSetter',
														initialValue: () => ({
															group: '组',
															span: 24,
														}),
														props: {
															config: {
																items: [
																	{
																		name: 'group',
																		title: {
																			label: '组',
																			tip: '不做任何作用的字段仅仅是标记分组',
																		},
																		propType: 'number',
																		isRequired: true,
																		setter: {
																			componentName: 'StringSetter',
																		},
																	},
																	{
																		name: 'span',
																		title: {
																			label: '组宽',
																			tip: '组宽，共 24 分栏',
																		},
																		propType: 'number',
																		setter: {
																			componentName: 'NumberSetter',
																			initialValue: 24,
																			props: {
																				min: 1,
																				max: 24,
																			},
																		},
																	},
																],
															},
														},
													},
													childrenSetter: {
														componentName: 'ObjectSetter',
														initialValue: (target: any) => ({
															property: {
																targetClass:
																	target.top.getPropValue('targetClass') || '',
															},
															span: 24,
															titleWidth: 150,
															title: '标题',
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
																						localStorage.getItem(
																							'entity-selector-config'
																						) || '[]'
																					);
																					const topFieldType =
																						value?.topFieldType;

																					const entitySelectorItem =
																						entitySelector.find(
																							(item: any) =>
																								item?.targetClass ===
																								topFieldType
																						);

																					const tInfo = JSON.parse(
																						entitySelectorItem.tInfo
																					);

																					// 当选择的不是实体字段的时候数据类型在文本，数字，布尔，枚举，条码中选择
																					const fieldType = value?.fieldType;
																					const fieldTypeFlag =
																						value?.fieldTypeFlag;
																					if (fieldTypeFlag === '2') {
																						// 枚举
																						const enumInfo =
																							value?.enumInfo || [];
																						const enumOptions = enumInfo?.map(
																							(item: any) => ({
																								label: item.value,
																								value: item.key,
																							})
																						);
																						updateColumns(
																							'enum',
																							entitySelectorItem?.id ||
																								'disabledEdit',
																							{
																								editDataConfig:
																									tInfo?.dataConfig,
																								editColumns: tInfo?.columns,
																								filterDataConfig:
																									tInfo?.dataConfig,
																								filterColumns: tInfo?.columns,
																								enumOptions,
																							}
																						);
																					} else {
																						switch (fieldType) {
																							case 'java.lang.Integer':
																								updateColumns(
																									'number',
																									entitySelectorItem?.id ||
																										'disabledEdit',
																									{
																										editDataConfig:
																											tInfo?.dataConfig,
																										editColumns: tInfo?.columns,
																										filterDataConfig:
																											tInfo?.dataConfig,
																										filterColumns:
																											tInfo?.columns,
																										digits: 0,
																									}
																								);
																								break;
																							case 'java.lang.Long':
																								updateColumns(
																									'number',
																									entitySelectorItem?.id ||
																										'disabledEdit',
																									{
																										editDataConfig:
																											tInfo?.dataConfig,
																										editColumns: tInfo?.columns,
																										filterDataConfig:
																											tInfo?.dataConfig,
																										filterColumns:
																											tInfo?.columns,
																										digits: 0,
																									}
																								);
																								break;
																							case 'java.math.BigDecimal':
																								updateColumns(
																									'number',
																									entitySelectorItem?.id ||
																										'disabledEdit',
																									{
																										editDataConfig:
																											tInfo?.dataConfig,
																										editColumns: tInfo?.columns,
																										filterDataConfig:
																											tInfo?.dataConfig,
																										filterColumns:
																											tInfo?.columns,
																										digits: 0,
																									}
																								);
																								break;
																							case 'java.lang.Boolean':
																								updateColumns(
																									'boolean',
																									entitySelectorItem?.id ||
																										'disabledEdit',
																									{
																										editDataConfig:
																											tInfo?.dataConfig,
																										editColumns: tInfo?.columns,
																										filterDataConfig:
																											tInfo?.dataConfig,
																										filterColumns:
																											tInfo?.columns,
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
																									entitySelectorItem?.id ||
																										'disabledEdit',
																									{
																										editDataConfig:
																											tInfo?.dataConfig,
																										editColumns: tInfo?.columns,
																										filterDataConfig:
																											tInfo?.dataConfig,
																										filterColumns:
																											tInfo?.columns,
																										dateFormatter:
																											'YYYY-MM-DD HH:mm:ss',
																									}
																								);
																								break;
																							default:
																								updateColumns(
																									'text',
																									entitySelectorItem?.id ||
																										'disabledEdit',
																									{
																										editDataConfig:
																											tInfo?.dataConfig,
																										editColumns: tInfo?.columns,
																										filterDataConfig:
																											tInfo?.dataConfig,
																										filterColumns:
																											tInfo?.columns,
																									}
																								);
																								break;
																						}
																					}
																				} else {
																					// 当选择的不是实体字段的时候数据类型在文本，数字，布尔，枚举，条码中选择
																					const fieldType = value?.fieldType;
																					const fieldTypeFlag =
																						value?.fieldTypeFlag;
																					if (fieldTypeFlag === '2') {
																						// 枚举
																						const enumInfo =
																							value?.enumInfo || [];
																						const enumOptions = enumInfo?.map(
																							(item: any) => ({
																								label: item.value,
																								value: item.key,
																							})
																						);
																						updateColumns('enum', 'select', {
																							enumOptions,
																						});
																					} else {
																						switch (fieldType) {
																							case 'java.lang.Integer':
																								updateColumns(
																									'number',
																									'number',
																									{
																										digits: 0,
																									}
																								);
																								break;
																							case 'java.lang.Long':
																								updateColumns(
																									'number',
																									'number',
																									{
																										digits: 0,
																									}
																								);
																								break;
																							case 'java.math.BigDecimal':
																								updateColumns(
																									'number',
																									'number',
																									{
																										digits: 0,
																									}
																								);
																								break;
																							case 'java.lang.Boolean':
																								updateColumns(
																									'boolean',
																									'boolean',
																									{
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
																								updateColumns('date', 'date', {
																									dateFormatter:
																										'YYYY-MM-DD HH:mm:ss',
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
																					const path = cloneDeep(
																						target.getParent().path
																					);
																					path?.shift();
																					const position = path?.join('.');
																					const columnsValue = cloneDeep(
																						target.top.getPropValue('formTabs')
																					);

																					const oldColumn =
																						get(columnsValue, position) || {};

																					const newColumn = {
																						...omit(
																							oldColumn,
																							'dataType',
																							'dateFormatter',
																							'timeFormatter',
																							'isTextarea',
																							'codeSize',
																							'showCodeValue',
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
																					set(
																						columnsValue,
																						position,
																						newColumn
																					);
																					target.node.setPropValue(
																						'formTabs',
																						columnsValue
																					);
																				}
																			},
																		},
																	},
																	{
																		name: 'title',
																		title: '标题',
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

																					{
																						title: '条码',
																						value: 'code',
																					},
																				],
																			},
																		},
																		extraProps: {
																			setValue: (target: any, value: any) => {
																				switch (value) {
																					case 'enum':
																						const enumInfo =
																							target
																								.getParent()
																								.getPropValue('property')
																								?.enumInfo || [];
																						const enumOptions = enumInfo?.map(
																							(item: any) => ({
																								label: item.value,
																								value: item.key,
																							})
																						);
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
																							dateFormatter:
																								'YYYY-MM-DD HH:mm:ss',
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
																				function updateColumns(
																					obj?: Record<string, any>
																				) {
																					const path = cloneDeep(
																						target.getParent().path
																					);
																					path?.shift();
																					const position = path?.join('.');
																					const columnsValue = cloneDeep(
																						target.top.getPropValue('formTabs')
																					);
																					const oldColumn =
																						get(columnsValue, position) || {};

																					const newColumn = {
																						...omit(
																							oldColumn,
																							'dateFormatter',
																							'isTextarea',
																							'codeSize',
																							'showCodeValue',
																							'timeFormatter',
																							'digits',
																							'boolOptions',
																							'enumOptions',
																							'codeType',
																							'onLinkClick'
																						),
																						...obj,
																					};
																					set(
																						columnsValue,
																						position,
																						newColumn
																					);
																					target.node.setPropValue(
																						'formTabs',
																						columnsValue
																					);
																				}
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
																					const tInfo = JSON.parse(
																						value?.tInfo || '{}'
																					);
																					updateColumns({
																						editDataConfig: tInfo?.dataConfig,
																						editColumns: tInfo?.columns,
																						filterDataConfig: tInfo?.dataConfig,
																						filterColumns: tInfo?.columns,
																					});
																				}

																				function updateColumns(
																					obj?: Record<string, any>
																				) {
																					const path = cloneDeep(
																						target.getParent().path
																					);
																					path?.shift();
																					const position = path?.join('.');
																					const columnsValue = cloneDeep(
																						target.top.getPropValue('formTabs')
																					);

																					const oldColumn =
																						get(columnsValue, position) || {};

																					const newColumn = {
																						...omit(
																							oldColumn,
																							'editDataConfig',
																							'editColumns',
																							'filterDataConfig',
																							'filterColumns'
																						),
																						...obj,
																					};
																					set(
																						columnsValue,
																						position,
																						newColumn
																					);
																					target.node.setPropValue(
																						'formTabs',
																						columnsValue
																					);
																				}
																			},
																		},
																	},
																	{
																		name: 'dateFormatter',
																		title: '日期格式',
																		condition: (target: any) =>
																			target
																				.getParent()
																				.getPropValue('dataType') === 'date',
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
																						value:
																							'YYYY年MM月DD日 HH时mm分ss秒',
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
																			target
																				.getParent()
																				.getPropValue('dataType') === 'time',
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
																		name: 'isTextarea',
																		title: '文本域',
																		condition: (target: any) =>
																			target
																				.getParent()
																				.getPropValue('dataType') === 'text',
																		setter: {
																			componentName: 'BoolSetter',
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
																			target
																				.getParent()
																				.getPropValue('dataType') === 'number',
																	},
																	{
																		name: 'boolOptions',
																		title: '布尔数据',
																		condition: (target: any) =>
																			target
																				.getParent()
																				.getPropValue('dataType') === 'boolean',
																		setter: {
																			componentName: 'JsonSetter',
																		},
																	},
																	{
																		name: 'enumOptions',
																		title: '枚举数据',
																		condition: (target: any) =>
																			target
																				.getParent()
																				.getPropValue('dataType') === 'enum',
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
																			target
																				.getParent()
																				.getPropValue('dataType') === 'code',
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
																		name: 'codeSize',
																		title: '条码大小',
																		condition: (target: any) =>
																			target
																				.getParent()
																				.getPropValue('dataType') === 'code',
																		setter: {
																			componentName: 'NumberSetter',
																			initialValue: 150,
																			props: {
																				min: 1,
																			},
																		},
																	},
																	{
																		name: 'showCodeValue',
																		title: '显示条码值',
																		condition: (target: any) =>
																			target
																				.getParent()
																				.getPropValue('dataType') === 'code',
																		setter: {
																			componentName: 'BoolSetter',
																			initialValue: true,
																		},
																	},
																	{
																		name: 'span',
																		title: {
																			label: '列宽',
																			tip: '列宽，共 24 分栏',
																		},
																		propType: 'number',
																		setter: {
																			componentName: 'NumberSetter',
																			initialValue: 24,
																			props: {
																				min: 1,
																				max: 24,
																			},
																		},
																	},
																	{
																		name: 'align',
																		title: {
																			label: '内容对齐',
																			tip: '内容对齐方式',
																		},
																		setter: {
																			componentName: 'SegmentedSetter',
																			initialValue: 'left',
																			props: {
																				options: [
																					{ label: '左', value: 'left' },
																					{ label: '中', value: 'center' },
																					{ label: '右', value: 'right' },
																				],
																			},
																		},
																	},
																	{
																		name: 'validConfig',
																		title: {
																			label: '编辑校验',
																		},
																		condition: (target: any) =>
																			!!target
																				.getParent()
																				.getPropValue('property').fieldName,
																		setter: {
																			componentName: 'ArraySetter',
																			props: {
																				itemSetter: {
																					componentName: 'ObjectSetter',
																					props: {
																						config: {
																							items: [
																								{
																									name: 'content',
																									title: '提示消息',
																									isRequired: true,
																									setter: 'StringSetter',
																								},
																								{
																									name: 'required',
																									title: '是否必填',
																									isRequired: true,
																									setter: 'BoolSetter',
																								},
																								{
																									name: 'min',
																									title: '最小值',
																									setter: 'NumberSetter',
																								},
																								{
																									name: 'max',
																									title: '最大值',
																									setter: 'NumberSetter',
																								},
																								{
																									name: 'pattern',
																									title: '正则表达式',
																									setter: 'TextareaSetter',
																								},

																								{
																									name: 'trigger',
																									title: '触发方式',
																									initialValue: 'blur',
																									setter: {
																										componentName:
																											'SelectSetter',
																										props: {
																											options: [
																												{
																													title: '失去焦点',
																													value: 'blur',
																												},
																												{
																													title: '值变化',
																													value: 'change',
																												},
																												{
																													title: '手动',
																													value: 'manual',
																												},
																											],
																										},
																									},
																								},
																								{
																									name: 'validator',
																									title: '自定义校验函数',
																									setter: 'FunctionSetter',
																								},
																							],
																						},
																					},
																				},
																			},
																		},
																	},
																	{
																		display: 'accordion',
																		type: 'group',
																		title: {
																			label: '实体选择器设置',
																			tip: '用于设置编辑和筛选的实体选择器的情况',
																		},
																		condition: (target: any) =>
																			target
																				.getParent()
																				.getPropValue('editType') &&
																			![
																				'disabledEdit',
																				'select',
																				'date',
																				'time',
																				'number',
																				'text',
																				'boolean',
																			].includes(
																				target
																					.getParent()
																					.getPropValue('editType')
																			),

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
																		],
																	},
																	{
																		name: 'verticalAlign',
																		title: {
																			label: '垂直对齐',
																			tip: '项垂直的对齐方式',
																		},
																		setter: {
																			componentName: 'SegmentedSetter',
																			initialValue: '',
																			props: {
																				options: [
																					{ label: '居中', value: 'center' },
																					{ label: '默认', value: '' },
																				],
																			},
																		},
																	},
																	{
																		name: 'showTitle',
																		title: '是否显示标题',
																		setter: {
																			componentName: 'BoolSetter',
																			initialValue: true,
																		},
																	},
																	{
																		name: 'titleBackground',
																		title: '标题背景',
																		setter: {
																			componentName: 'BoolSetter',
																			initialValue: false,
																		},
																	},
																	{
																		name: 'titleAlign',
																		title: '标题对齐',
																		setter: {
																			componentName: 'SegmentedSetter',
																			initialValue: 'left',
																			props: {
																				options: [
																					{ label: '左', value: 'left' },
																					{ label: '中', value: 'center' },
																					{ label: '右', value: 'right' },
																				],
																			},
																		},
																	},
																	{
																		name: 'titleWidth',
																		title: '标题宽度',
																		setter: {
																			componentName: 'NumberSetter',
																			initialValue: 150,
																		},
																	},
																	{
																		name: 'titleBold',
																		title: '标题加粗',
																		setter: {
																			componentName: 'BoolSetter',
																			initialValue: false,
																		},
																	},
																	{
																		name: 'titleColon',
																		title: '显示冒号',
																		setter: {
																			componentName: 'BoolSetter',
																			initialValue: false,
																		},
																	},
																	{
																		name: 'titleAsterisk',
																		title: {
																			label: '显示星号',
																			tip: '是否显示必填字段的红色星号',
																		},
																		setter: {
																			componentName: 'BoolSetter',
																			initialValue: true,
																		},
																	},
																	{
																		name: 'showContent',
																		title: '是否显示内容',
																		setter: {
																			componentName: 'BoolSetter',
																			initialValue: true,
																		},
																	},
																	{
																		name: 'vertical',
																		title: '垂直布局',
																		setter: {
																			componentName: 'BoolSetter',
																		},
																	},
																	{
																		name: 'className',
																		title: {
																			label: '项类名',
																			tip: '给表单项附加 className',
																		},
																		setter: {
																			componentName: 'StringSetter',
																		},
																	},
																	{
																		name: 'titleClassName',
																		title: {
																			label: '标题类名',
																			tip: '给表单项标题附加 className',
																		},
																		setter: {
																			componentName: 'StringSetter',
																		},
																	},
																	{
																		name: 'contentClassName',
																		title: {
																			label: '内容类名',
																			tip: '给表单项内容附加 className',
																		},
																		setter: {
																			componentName: 'StringSetter',
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
							},
						},
					},
				},
			},
			{
				title: '统一外观',
				name: 'formConfig',
				display: 'entry',
				items: [
					{
						name: 'align',
						title: {
							label: '内容对齐',
							tip: '所有项的内容对齐方式',
						},
						setter: {
							componentName: 'SegmentedSetter',
							initialValue: 'left',
							props: {
								options: [
									{
										label: '靠左',
										value: 'left',
									},
									{
										label: '居中',
										value: 'center',
									},
									{
										label: '靠右',
										value: 'right',
									},
								],
							},
						},
					},
					{
						name: 'span',
						title: {
							label: '栅格列数',
							tip: '所有项的栅格占据的列数（共 24 分栏）',
						},
						setter: {
							componentName: 'NumberSetter',
							initialValue: 24,
							props: {
								min: 1,
								max: 24,
							},
						},
					},
					{
						name: 'verticalAlign',
						title: {
							label: '垂直对齐',
							tip: '所有项的垂直对齐方式',
						},
						setter: {
							componentName: 'SegmentedSetter',
							initialValue: 'center',
							props: {
								options: [
									{ label: '居中', value: 'center' },
									{ label: '默认', value: '' },
								],
							},
						},
					},
					{
						name: 'border',
						title: '显示边框',
						setter: {
							componentName: 'BoolSetter',
							initialValue: true,
						},
					},
					{
						name: 'size',
						title: '尺寸',
						setter: {
							componentName: 'SelectSetter',
							initialValue: 'medium',
							props: {
								options: [
									{ title: '大', value: 'large' },
									{ title: '中', value: 'medium' },
									{ title: '小', value: 'small' },
									{ title: '迷你', value: 'mini' },
								],
							},
						},
					},
					{
						name: 'titleBackground',
						title: '标题背景',
						setter: {
							componentName: 'BoolSetter',
							initialValue: false,
						},
					},
					{
						name: 'titleAlign',
						title: {
							label: '标题对齐',
							tip: '所有项的标题对齐方式',
						},
						setter: {
							componentName: 'SegmentedSetter',
							initialValue: 'left',
							props: {
								options: [
									{ label: '靠左', value: 'left' },
									{ label: '靠右', value: 'right' },
									{ label: '居中', value: 'center' },
								],
							},
						},
					},
					{
						name: 'titleWidth',
						title: {
							label: '标题宽度',
							tip: '所有项的标题宽度',
						},
						setter: {
							componentName: 'NumberSetter',
							initialValue: 100,
						},
					},
					{
						name: 'titleColon',
						title: '显示冒号',
						setter: {
							componentName: 'BoolSetter',
							initialValue: false,
						},
					},
					{
						name: 'titleAsterisk',
						title: '显示星号',
						setter: {
							componentName: 'BoolSetter',
							initialValue: true,
						},
					},
					{
						name: 'padding',
						title: '显示边距',
						setter: {
							componentName: 'BoolSetter',
							initialValue: true,
						},
					},
					{
						name: 'vertical',
						title: {
							label: '垂直布局',
							tip: '设置所有项使用垂直布局',
						},
						setter: {
							componentName: 'BoolSetter',
							initialValue: false,
						},
					},
					{
						name: 'className',
						title: '自定义类名',
						setter: {
							componentName: 'StringSetter',
						},
					},
					{
						name: 'readonly',
						title: {
							label: '只读模式',
							tip: '设置表单为只读状态，所有被支持的控件会默认继承该属性，在只读模式中，校验功能将被不会生效',
						},
						setter: {
							componentName: 'BoolSetter',
						},
					},
					{
						name: 'disabled',
						title: {
							label: '禁用模式',
							tip: '设置表单为禁用状态，所有被支持的控件会默认继承该属性，在禁用模式中，校验功能是有效的',
						},
						setter: {
							componentName: 'BoolSetter',
						},
					},
				],
			},
		],
	},
];
