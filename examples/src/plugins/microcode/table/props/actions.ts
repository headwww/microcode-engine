export default [
	{
		name: 'actionConfig',
		title: {
			label: '操作列',
			tip: '操作列, 在表格右侧添加操作按钮',
		},
		display: 'entry',
		items: [
			{
				name: 'title',
				title: {
					label: '标题',
					tip: '标题, 用于显示操作列的标题',
				},
				setter: {
					initialValue: '操作',
					componentName: 'StringSetter',
				},
			},
			{
				name: 'width',
				title: {
					label: '宽度',
					tip: '宽度, 用于显示操作列的宽度',
				},
				setter: {
					initialValue: 200,
					componentName: 'NumberSetter',
				},
			},
			{
				name: 'fixed',
				title: '固定列',
				setter: {
					initialValue: 'right',
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
				name: 'buttonType',
				title: {
					label: '按钮类型',
					tip: '按钮类型, 用于显示操作列的按钮类型',
				},
				setter: {
					initialValue: 'link',
					componentName: 'SegmentedSetter',
					props: {
						options: [
							{ label: '链接', value: 'link' },
							{ label: '按钮', value: 'default' },
						],
					},
				},
			},
			{
				name: 'hidden',
				title: {
					label: '是否隐藏',
					tip: '是否隐藏,关闭是不隐藏，用于显示操作列的隐藏状态',
				},
				setter: {
					initialValue: false,
					componentName: 'BoolSetter',
				},
			},
			{
				name: 'maxShowCount',
				title: {
					label: '展示数量',
					tip: '最大展示数量, 用于显示操作列的最大展示数量,超过的部分会折叠',
				},
				setter: {
					initialValue: 3,
					componentName: 'NumberSetter',
				},
			},
			{
				name: 'actions',
				title: {
					label: '操作项',
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
							initialValue: () => ({
								title: '标题',
							}),
							props: {
								config: {
									items: [
										{
											name: 'title',
											title: '标题',
											propType: 'string',
											isRequired: true,
											setter: 'StringSetter',
										},
										{
											name: 'onAction',
											title: '点击事件',
											propType: 'function',
											setter: 'FunctionSetter',
										},
										{
											name: 'onDisabled',
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
];
