export default [
	{
		name: 'data',
		title: '数据源',
		display: 'block',
		setter: 'JsonSetter',
	},
	{
		name: 'loading',
		title: '加载动画',
		setter: 'BoolSetter',
	},
	{
		name: 'targetClass',
		title: '目标类',
		setter: 'TextareaSetter',
		extraProps: {
			setValue: (target: any, value: string) => {
				const columns = target.getParent().getPropValue('columns');
				if (Array.isArray(columns)) {
					columns.forEach((column) => {
						if (column.property) {
							column.property.targetClass = value;
						}
					});

					target.node.setPropValue('columns', columns);
				}
			},
		},
	},
];
