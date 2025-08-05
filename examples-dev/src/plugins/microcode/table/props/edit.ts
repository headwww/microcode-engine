export default [
	{
		title: {
			label: '编辑配置',
			tip: '设置编辑的配置',
		},
		display: 'entry',
		name: 'editConfig',
		items: [
			{
				name: 'enabled',
				title: {
					label: '是否启用',
					tip: '是否启用编辑',
				},
				setter: {
					initialValue: true,
					componentName: 'BoolSetter',
				},
			},
			{
				name: 'trigger',
				title: {
					label: '触发方式',
					tip: '分别为手动触发方式，只能用于 mode=row，click（点击触发编辑），dblclick（双击触发编辑）',
				},
				setter: {
					initialValue: 'click',
					componentName: 'SelectSetter',
					props: {
						options: [
							{
								title: '点击触发编辑',
								value: 'click',
							},
							{
								title: '双击触发编辑',
								value: 'dblclick',
							},
							{
								title: '手动触发编辑',
								value: 'manual',
							},
						],
					},
				},
			},
			{
				name: 'mode',
				title: {
					label: '编辑模式',
					tip: '编辑模式',
				},
				setter: {
					initialValue: 'cell',
					componentName: 'SegmentedSetter',
					props: {
						options: [
							{
								label: '单元格编辑',
								value: 'cell',
							},
							{
								label: '行编辑',
								value: 'row',
							},
						],
					},
				},
			},
			{
				name: 'showAsterisk',
				title: {
					label: '红色星号',
					tip: '是否显示必填字段的红色星号',
				},
				setter: {
					initialValue: true,
					componentName: 'BoolSetter',
				},
			},
			{
				name: 'showIcon',
				title: {
					label: '列头图标',
					tip: '是否显示列头编辑图标',
				},
				setter: {
					initialValue: true,
					componentName: 'BoolSetter',
				},
			},
			{
				name: 'showUpdateStatus',
				title: {
					label: '修改状态',
					tip: '是否显示单元格修改状态',
				},
				setter: {
					initialValue: true,
					componentName: 'BoolSetter',
				},
			},
			{
				name: 'showInsertStatus',
				title: {
					label: '插入状态',
					tip: '是否显示单元格插入状态',
				},
				setter: {
					initialValue: true,
					componentName: 'BoolSetter',
				},
			},
			{
				name: 'autoPos',
				title: {
					label: '自动定位',
					tip: '当单元格被激活为编辑状态时，是否自动定位',
				},
				setter: {
					initialValue: true,
					componentName: 'BoolSetter',
				},
			},
			{
				name: 'autoFocus',
				title: {
					label: '自动聚焦',
					tip: '当单元格被激活为编辑状态时，是否自动聚焦',
				},
				setter: {
					initialValue: true,
					componentName: 'BoolSetter',
				},
			},
			{
				name: 'autoClear',
				title: {
					label: '自动清除',
					tip: '建议关闭，开启会影响某些下拉选择器实体选择器的聚焦，当点击表格之外或者非编辑列之后，是否自动清除单元格的激活状态',
				},
				setter: {
					initialValue: true,
					componentName: 'BoolSetter',
				},
			},
			{
				name: 'beforeEditMethod',
				title: {
					label: '拦截编辑',
					tip: '自定义编辑之前逻辑，该方法的返回值用来决定该单元格是否允许编辑',
				},
				setter: {
					componentName: 'FunctionSetter',
				},
			},
			{
				name: 'afterEditMethod',
				title: {
					label: '自定义编辑之后逻辑',
				},
				setter: {
					componentName: 'FunctionSetter',
				},
			},
		],
	},
];
