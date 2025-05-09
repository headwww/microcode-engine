export default [
	{
		title: {
			label: 'refId',
			tip: '用于获取组件实例，调用物料内部方法',
			icon: '',
		},
		name: 'ref',
		setter: {
			componentName: 'StringSetter',
		},
		extraProps: {
			display: 'block',
			supportVariable: false,
		},
	},
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
		title: {
			label: '目标类',
			tip: '需要用户选择一个在后端（服务端）定义好的 ORM 实体',
		},
		setter: 'TargetClassSetter',
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
