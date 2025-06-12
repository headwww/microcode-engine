export default [
	{
		name: 'toolbar',
		title: {
			label: '顶部操作',
		},
		type: 'group',
		display: 'entry',
		items: [
			{
				name: 'buttons',
				title: {
					label: '业务按钮',
					tip: '业务按钮, 在表格顶部左侧显示',
				},
				extraProps: {
					supportVariable: false,
				},
				setter: {
					componentName: 'ArraySetter',
					props: {
						itemSetter: {
							componentName: 'ObjectSetter',
							extraProps: {
								supportVariable: false,
							},
							initialValue: () => {
								let guid = Date.now();
								function uniqueId(prefix = '') {
									return `${prefix}${(guid++).toString(36).toLowerCase()}`;
								}
								return {
									id: uniqueId('button_'),
									label: '按钮',
									mode: 'button',
									type: 'default',
								};
							},
							props: {
								config: {
									items: [
										{
											name: 'mode',
											title: '按钮类型',
											propType: 'string',
											setter: {
												componentName: 'SegmentedSetter',
												props: {
													options: [
														{ label: '按钮', value: 'button' },
														{ label: '下拉', value: 'dropdown' },
													],
												},
											},
											extraProps: {
												setValue: (target: any, value: string) => {
													const key = target.getParent().key;
													if (value === 'button') {
														target.node.setPropValue(
															`buttons.${key}.menus`,
															null
														);
													} else {
														target.node.setPropValue(
															`buttons.${key}.onClick`,
															null
														);
														target.node.setPropValue(
															`buttons.${key}.disabled`,
															null
														);
													}
												},
											},
										},

										{
											name: 'id',
											title: '按钮ID',
											propType: 'string',
											setter: 'StringSetter',
										},
										{
											name: 'label',
											title: '按钮名称',
											propType: 'string',
											isRequired: true,
											setter: 'StringSetter',
										},
										{
											name: 'loading',
											title: '是否显示加载状态',
											setter: 'BoolSetter',
										},
										{
											name: 'type',
											title: '按钮类型',
											propType: 'string',
											isRequired: true,
											initialValue: 'default',
											setter: {
												componentName: 'SelectSetter',
												props: {
													options: [
														{ label: '默认', value: 'default' },
														{ label: '主色', value: 'primary' },
														{ label: '链接', value: 'link' },
														{ label: '文本', value: 'text' },
														{ label: '虚线', value: 'dashed' },
														{ label: '幽灵', value: 'ghost' },
													],
												},
											},
										},
										{
											name: 'validate',
											title: {
												label: '按钮校验',
												tip: '全表触发就不需要考虑选中行触发和表单触发，选中行触发判断当前是表单模式还是表格模式，表格模式用表格模式的校验。表单模式用表单模式的校验',
											},
											condition: (target: any) =>
												target.getParent().getPropValue('mode') === 'button',
											setter: {
												componentName: 'SelectSetter',
												initialValue: 'none',
												props: {
													options: [
														{
															title: '不校验',
															value: 'none',
														},
														{
															title: '全表校验',
															value: 'full',
														},
														{
															title: '选中校验',
															value: 'checked',
														},
													],
												},
											},
										},
										{
											name: 'onClick',
											title: '点击事件',
											propType: 'function',
											setter: 'FunctionSetter',
											condition: (target: any) =>
												target.getParent().getPropValue('mode') === 'button',
										},
										{
											name: 'disabled',
											title: '是否禁用',
											propType: 'function',
											setter: 'FunctionSetter',
											condition: (target: any) =>
												target.getParent().getPropValue('mode') === 'button',
										},
										{
											name: 'menus',
											title: '下拉菜单',
											propType: 'array',
											condition: (target: any) =>
												target.getParent().getPropValue('mode') === 'dropdown',
											setter: {
												componentName: 'ArraySetter',
												props: {
													itemSetter: {
														componentName: 'ObjectSetter',
														initialValue: () => {
															let guid = Date.now();
															function uniqueId(prefix = '') {
																return `${prefix}${(guid++).toString(36).toLowerCase()}`;
															}
															return {
																id: uniqueId('menu_item_'),
																label: '按钮',
															};
														},
														props: {
															config: {
																items: [
																	{
																		name: 'id',
																		title: '菜单ID',
																		propType: 'string',
																		setter: 'StringSetter',
																	},
																	{
																		name: 'label',
																		title: '菜单名称',
																		propType: 'string',
																		isRequired: true,
																		setter: 'StringSetter',
																	},
																	{
																		name: 'validate',
																		title: {
																			label: '按钮校验',
																			tip: '全表触发就不需要考虑选中行触发和表单触发，选中行触发判断当前是表单模式还是表格模式，表格模式用表格模式的校验。表单模式用表单模式的校验',
																		},
																		setter: {
																			componentName: 'SelectSetter',
																			initialValue: 'none',
																			props: {
																				options: [
																					{
																						title: '不校验',
																						value: 'none',
																					},
																					{
																						title: '全表校验',
																						value: 'full',
																					},
																					{
																						title: '选中校验',
																						value: 'checked',
																					},
																				],
																			},
																		},
																	},
																	{
																		name: 'onClick',
																		title: '点击事件',
																		propType: 'function',
																		setter: 'FunctionSetter',
																	},
																	{
																		name: 'disabled',
																		title: '是否禁用',
																		propType: 'function',
																		setter: 'FunctionSetter',
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
				name: 'onRefresh',
				title: '刷新事件',
				propType: 'function',
				setter: 'FunctionSetter',
			},
		],
	},
];
