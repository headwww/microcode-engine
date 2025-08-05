export default [
	{
		name: 'rowSelectorConfig',
		title: {
			label: '行选择器',
			tip: '行选择器，用于选择表格中的行',
		},
		display: 'entry',
		items: [
			{
				name: 'visible',
				title: {
					label: '是否显示',
				},
				setter: {
					componentName: 'BoolSetter',
					initialValue: true,
				},
			},
			{
				name: 'title',
				title: {
					label: '标题',
				},
				setter: {
					componentName: 'StringSetter',
				},
			},
			{
				name: 'type',
				title: {
					label: '类型',
					tip: '单选，多选',
				},
				setter: {
					componentName: 'SegmentedSetter',
					initialValue: 'checkbox',
					props: {
						options: [
							{ label: '多选', value: 'checkbox' },
							{ label: '单选', value: 'radio' },
						],
					},
				},
			},
			{
				name: 'width',
				title: {
					label: '宽度',
				},
				setter: {
					componentName: 'NumberSetter',
					initialValue: 60,
				},
			},
			{
				name: 'trigger',
				title: {
					label: '触发方式',
				},
				setter: {
					componentName: 'SelectSetter',
					initialValue: 'row',
					props: {
						options: [
							{ label: '默认', value: '' },
							{ label: '单元格', value: 'cell' },
							{ label: '行', value: 'row' },
						],
					},
				},
			},
			{
				name: 'labelField',
				title: {
					label: '绑定字段',
					tip: '输入其他列的字段，可以直接显示在复选框中',
				},
				setter: {
					componentName: 'StringSetter',
				},
			},
			{
				name: 'highlight',
				title: {
					label: '高亮勾选行',
				},
				setter: {
					componentName: 'BoolSetter',
					initialValue: true,
				},
			},
			{
				name: 'range',
				title: {
					label: '范围选择',
					tip: '开启复选框范围选择功能，启用后通过鼠标在复选框的列内滑动选中或取消指定行',
				},
				setter: {
					componentName: 'BoolSetter',
					initialValue: true,
				},
				condition: (target: any) =>
					target.getParent().getPropValue('type') === 'checkbox',
			},
			{
				name: 'checkAll',
				title: {
					label: '全选',
					tip: '默认勾选所有，只会在初始化时被触发一次',
				},
				setter: {
					componentName: 'BoolSetter',
				},
				condition: (target: any) =>
					target.getParent().getPropValue('type') === 'checkbox',
			},
			{
				name: 'checkStrictly',
				title: {
					label: '关联',
					tip: '只有tree表格和type为checkbox时生效，是否严格的遵循父子不互相关联的做法',
				},
				setter: {
					componentName: 'BoolSetter',
				},
				condition: (target: any) =>
					target.getParent().getPropValue('type') === 'checkbox',
			},
			{
				name: 'showHeader',
				title: {
					label: '列头全选',
					tip: '是否显示全选按钮，可以搭配关联模式使用，如果关联模式 checkStrictly=true 则默认为 false',
				},
				setter: {
					componentName: 'BoolSetter',
					initialValue: true,
				},
				condition: (target: any) =>
					target.getParent().getPropValue('type') === 'checkbox',
			},

			{
				name: 'strict',
				title: {
					label: '严格模式',
					tip: '当数据为空或全部禁用时，列头的复选框为禁用状态',
				},
				setter: {
					componentName: 'BoolSetter',
				},
			},
			{},
			{
				name: 'checkMethod',
				title: {
					label: '是否允许勾选',
					tip: '是否允许勾选的函数，该函数的返回值用来决定这一行是否可以勾选',
				},
				setter: {
					componentName: 'FunctionSetter',
				},
			},
			{
				name: 'visibleMethod',
				title: {
					label: '是否允许显示',
					tip: '是否允许显示的函数，该函数的返回值用来决定这一行是否显示',
				},
				setter: {
					componentName: 'FunctionSetter',
				},
			},
		],
	},
];
