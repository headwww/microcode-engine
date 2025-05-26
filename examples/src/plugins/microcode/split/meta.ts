export default {
	componentName: 'Split',
	title: '分割器',
	category: '布局',
	group: '基础组件',
	npm: {
		package: 'ArvinMicrocode',
		destructuring: true,
		exportName: 'Split',
		version: '1.0.0',
	},
	configure: {
		component: {
			isContainer: true,
		},
		props: [
			{
				name: 'vertical',
				title: { label: '布局方式', tip: 'true是垂直布局，false是水平布局' },
				setter: {
					componentName: 'BoolSetter',
					initialValue: true,
				},
			},
			{
				name: 'items',
				title: '分割器项',
				setter: {
					componentName: 'ArraySetter',
					props: {
						itemSetter: {
							componentName: 'ObjectSetter',
							props: {
								config: {
									items: [
										{
											name: 'key',
											title: 'key',
											setter: 'StringSetter',
											initialValue: (val: any) =>
												val ||
												`pane-item-${((Math.random() * 1e6) >> 0).toString(36)}`,
											isRequired: true,
										},
										{
											name: 'width',
											title: '面板的宽度',
											setter: {
												componentName: 'StringSetter',
												props: {
													placeholder: '单位(px,%,vh,vw)',
												},
											},
										},
										{
											name: 'height',
											title: '面板的高度',
											setter: {
												componentName: 'StringSetter',
												props: {
													placeholder: '单位(px,%,vh,vw)',
												},
											},
										},
										{
											name: 'minWidth',
											title: '面板的最小宽度',
											setter: {
												componentName: 'StringSetter',
												props: {
													placeholder: '单位(px,%,vh,vw)',
												},
											},
											initialValue: '',
										},
										{
											name: 'minHeight',
											title: '面板的最小高度',
											setter: {
												componentName: 'StringSetter',
												props: {
													placeholder: '单位(px,%,vh,vw)',
												},
											},
											initialValue: '',
										},
										{
											name: 'children',
											title: '内容',
											setter: {
												componentName: 'SlotSetter',
												initialValue: {
													type: 'JSSlot',
													value: [],
												},
											},
										},
									],
								},
							},
							initialValue: () => ({
								key: `pane-item-${((Math.random() * 1e6) >> 0).toString(36)}`,
								children: {
									type: 'JSSlot',
									value: [],
								},
							}),
						},
					},
				},
			},
			{
				name: 'splitLine',
				title: '分割线像素',
				setter: {
					componentName: 'NumberSetter',
					initialValue: 2,
				},
			},
			{
				name: 'width',
				title: '宽度',
				setter: {
					componentName: 'StringSetter',
					props: {
						placeholder: '单位(px,%,vh,vw)',
					},
					initialValue: '100%',
				},
			},
			{
				name: 'height',
				title: '高度',
				setter: {
					componentName: 'StringSetter',
					props: {
						placeholder: '单位(px,%,vh,vw)',
					},
					initialValue: '100%',
				},
			},
		],
	},
	snippets: [
		{
			title: '分割器',
			schema: {
				componentName: 'Split',
				props: {
					items: [
						{
							key: 'pane-item-1',
							children: {
								type: 'JSSlot',
								value: [],
							},
						},
						{
							key: 'pane-item-2',
							children: {
								type: 'JSSlot',
								value: [],
							},
						},
					],
				},
			},
		},
	],
};
