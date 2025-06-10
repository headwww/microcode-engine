export default [
	{
		name: 'tableId',
		title: {
			label: 'ID',
			tip: '用于分配权限使用，全局唯一ID，避免重复，重复会导致分配权限出现问题',
		},
		setter: {
			componentName: 'StringSetter',
			initialValue: () => {
				let guid = Date.now();
				function uniqueId(prefix = '') {
					return `${prefix}${(guid++).toString(36).toLowerCase()}`;
				}
				return uniqueId('lt_table_');
			},
		},
	},
	{
		title: {
			label: 'refId',
			tip: '用于获取组件实例，调用物料内部方法',
			icon: '',
		},
		name: 'ref',
		setter: {
			initialValue: () => {
				let guid = Date.now();
				function uniqueId(prefix = '') {
					return `${prefix}${(guid++).toString(36).toLowerCase()}`;
				}
				return uniqueId('lt_modal_');
			},
			componentName: 'StringSetter',
			props: {
				disabled: true,
			},
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
