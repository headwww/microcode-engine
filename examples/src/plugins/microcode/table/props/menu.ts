export default [
	{
		name: 'menuConfig',
		title: {
			label: '右键菜单',
			tip: '右键菜单, 在表格添加右键菜单',
		},
		display: 'entry',
		type: 'group',
		items: [
			{
				name: 'menuItems',
				title: {
					label: '菜单项',
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
									code: uniqueId('menu_item_'),
									name: '菜单',
								};
							},
							props: {
								config: {
									items: [
										{
											name: 'name',
											title: '菜单',
											propType: 'string',
											isRequired: true,
											setter: 'StringSetter',
										},
										{
											name: 'onClick',
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
										{
											name: 'onVisible',
											title: '是否显示',
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
