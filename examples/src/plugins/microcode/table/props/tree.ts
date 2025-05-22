import { isArray } from 'lodash';

export default [
	{
		name: 'treeConfig',
		title: {
			label: '树形表格',
			tip: '树形表格配置，用于配置树形表格的配置',
		},
		display: 'entry',
		items: [
			{
				name: 'transform',
				title: {
					label: '开启',
					tip: '自动将列表转为树结构（支持虚拟滚动）',
				},
				setter: {
					initialValue: false,
					componentName: 'BoolSetter',
				},
			},
			{
				name: 'treeNode',
				title: {
					label: '指定某列为树节点',
					tip: '只对 tree-config 配置时有效，指定某列为树节点',
				},
				condition: (target: any) =>
					!!target.getParent().getPropValue('transform'),
				setter: {
					initialValue: (target: any) => {
						console.log();
						const columns = target.top.getPropValue('columns');
						if (columns && isArray(columns) && columns.length > 0) {
							return columns[0]?.property?.fieldName;
						}

						return null;
					},
					componentName: 'StringSetter',
				},
			},
			{
				name: 'rowField',
				title: {
					label: '树节点字段名',
					tip: '用于 tree-config.transform，树节点的字段名',
				},
				condition: (target: any) =>
					!!target.getParent().getPropValue('transform'),
				setter: {
					initialValue: 'id',
					componentName: 'StringSetter',
				},
			},
			{
				name: 'parentField',
				title: {
					label: '树父节点字段名',
					tip: '用于 tree-config.transform，树父节点的字段名',
				},
				condition: (target: any) =>
					!!target.getParent().getPropValue('transform'),
				setter: {
					initialValue: 'parentId',
					componentName: 'StringSetter',
				},
			},
			{
				name: 'seqMode',
				title: {
					label: '序号模式',
					tip: '树结构序号显示模式，支持层级序号和自增序号（仅支持 transform）',
				},
				condition: (target: any) =>
					!!target.getParent().getPropValue('transform'),
				setter: {
					initialValue: 'default',
					componentName: 'SegmentedSetter',
					props: {
						options: [
							{ label: '层级序号', value: 'default' },
							{ label: '自增序号', value: 'increasing' },
						],
					},
				},
			},
			{
				name: 'padding',
				title: {
					label: '是否显示边距',
					tip: '是否显示边距',
				},
				condition: (target: any) =>
					!!target.getParent().getPropValue('transform'),
				setter: {
					initialValue: true,
					componentName: 'BoolSetter',
				},
			},
			{
				name: 'indent',
				title: {
					label: '树节点缩进',
					tip: '树节点的缩进',
				},
				condition: (target: any) =>
					!!target.getParent().getPropValue('transform'),
				setter: {
					initialValue: 20,
					componentName: 'NumberSetter',
				},
			},
			{
				name: 'showLine',
				title: {
					label: '显示连接线',
					tip: '树节点的连接线（启用连接线会降低渲染性能）',
				},
				condition: (target: any) =>
					!!target.getParent().getPropValue('transform'),
				setter: {
					initialValue: false,
					componentName: 'BoolSetter',
				},
			},
			{
				name: 'expandAll',
				title: {
					label: '默认展开',
					tip: '默认展开所有子孙树节点（只会在初始化时被触发一次）',
				},
				condition: (target: any) =>
					!!target.getParent().getPropValue('transform'),
				setter: {
					initialValue: false,
					componentName: 'BoolSetter',
				},
			},
			{
				name: 'accordion',
				title: {
					label: '手风琴模式',
					tip: '对于同一级的节点，每次只能展开一个',
				},
				condition: (target: any) =>
					!!target.getParent().getPropValue('transform'),
				setter: {
					initialValue: false,
					componentName: 'BoolSetter',
				},
			},
			{
				name: 'trigger',
				title: {
					label: '触发方式',
					tip: '触发方式（注：当多种功能重叠时，会同时触发）',
				},
				condition: (target: any) =>
					!!target.getParent().getPropValue('transform'),
				setter: {
					initialValue: 'default',
					componentName: 'SelectSetter',
					props: {
						options: [
							{ label: '点击按钮触发', value: 'default' },
							{ label: '点击单元格触发', value: 'cell' },
							{ label: '点击行触发', value: 'row' },
							{ label: '手动方式', value: 'manual' },
						],
					},
				},
			},
		],
	},
];
