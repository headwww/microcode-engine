export default [
	{
		name: 'footerConfig',
		title: {
			label: '表尾配置',
			tip: '表尾配置, 用于配置表尾信息',
		},
		display: 'entry',
		items: [
			{
				name: 'showFooter',
				title: {
					label: '是否启用',
				},
				setter: {
					initialValue: false,
					componentName: 'BoolSetter',
				},
			},
			{
				name: 'footerItems',
				title: {
					label: '表尾配置',
				},
				condition: (target: any) =>
					!!target.getParent().getPropValue('showFooter'),
				setter: {
					componentName: 'ArraySetter',
					props: {
						itemSetter: {
							componentName: 'ObjectSetter',
							props: {
								config: {
									items: [
										{
											name: 'label',
											title: {
												label: '表尾标签',
											},
											isRequired: true,
											setter: 'StringSetter',
										},
										{
											name: 'fields',
											title: {
												label: '表尾字段',
											},
											setter: 'JsonSetter',
										},
										{
											name: 'footerDataMethod',
											title: {
												label: '计算事件',
												tip: '写一个函数，实现标尾数据的计算',
											},
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
