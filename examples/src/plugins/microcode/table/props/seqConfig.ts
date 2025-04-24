export default [
	{
		name: 'seqConfig',
		title: {
			label: '序号配置',
		},
		display: 'entry',
		items: [
			{
				name: 'visible',
				title: {
					label: '是否显示',
					tip: '是否显示序号列',
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
					tip: '序号列的标题',
				},
				setter: {
					componentName: 'StringSetter',
					initialValue: '序号',
				},
			},
			{
				name: 'width',
				title: {
					label: '宽度',
					tip: '序号列的宽度',
				},
				setter: {
					componentName: 'NumberSetter',
					initialValue: 70,
				},
			},
			{
				name: 'startIndex',
				title: {
					label: '起始序号',
					tip: '起始序号，默认为1',
				},
				setter: {
					componentName: 'NumberSetter',
				},
			},
			{
				name: 'seqMethod',
				title: {
					label: '自定义方法',
					tip: '自定义序号的方法，该方法的返回值用来决定这一行的序号',
				},
				setter: {
					componentName: 'FunctionSetter',
				},
			},
		],
	},
];
