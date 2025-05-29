export default [
	{
		title: '表单配置',
		display: 'entry',
		type: 'group',
		items: [
			{
				name: 'formItems',
				title: '表单项',
				extraProps: {
					supportVariable: false,
				},
				setter: {
					componentName: 'ArraySetter',
					props: {
						itemSetter: {
							componentName: 'ObjectSetter',
							initialValue: (target: any) => ({
								property: {
									targetClass: target.top.getPropValue('targetClass') || '',
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
										},
										{
											name: 'title',
											title: '列标题',
											propType: 'string',
											isRequired: true,
											setter: 'StringSetter',
										},
										{
											name: 'span',
											title: '列宽',
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
											name: 'titleAlign',
											title: '标题对齐',
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
											name: 'showContent',
											title: '是否显示内容',
											setter: {
												componentName: 'BoolSetter',
												initialValue: true,
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
									],
								},
							},
						},
					},
				},
			},
			{
				title: '外观',
				name: 'formConfig',
				display: 'entry',
				items: [
					{
						name: 'align',
						title: {
							label: '对齐方式',
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
										label: '靠右',
										value: 'right',
									},
									{
										label: '居中',
										value: 'center',
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
