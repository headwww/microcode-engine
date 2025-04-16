import snippets from './snippets';

export default {
	snippets,
	componentName: 'Textarea',
	title: '长文本',
	category: '表单',
	group: '基础组件',
	npm: {
		package: 'ArvinMicrocode',
		destructuring: true,
		exportName: 'Textarea',
		version: '1.0.0',
	},

	configure: {
		props: [
			{
				name: 'defaultValue',
				title: { label: '默认值', tip: '默认内容' },
				setter: 'TextareaSetter',
			},
			{
				name: 'v-model:value',
				title: { label: '当前值', tip: '当前值' },
				setter: 'TextareaSetter',
			},
			{
				name: 'bordered',
				title: { label: '显示边框', tip: '是否有边框' },
				defaultValue: true,
				setter: 'BoolSetter',
			},
			{
				name: 'disabled',
				title: { label: '是否禁用', tip: '是否为禁用状态' },
				defaultValue: false,
				setter: 'BoolSetter',
			},
			{
				name: 'placeholder',
				title: { label: '占位提示', tip: '占位提示' },
				defaultValue: '请输入',
				setter: 'StringSetter',
			},
			{
				name: 'showCount',
				title: { label: '展示字数', tip: '是否展示字数' },
				defaultValue: false,
				setter: 'BoolSetter',
			},
			{
				name: 'id',
				title: { label: '输入框ID', tip: '输入框的ID' },
				setter: 'StringSetter',
			},
			{
				name: 'maxLength',
				title: { label: '最大长度', tip: '最大长度' },
				setter: 'NumberSetter',
			},
			{
				name: 'size',
				title: { label: '控件大小', tip: '控件大小' },
				setter: {
					componentName: 'RadioGroupSetter',
					props: {
						options: [
							{
								title: '大',
								value: 'large',
							},
							{
								title: '中',
								value: 'middle',
							},
							{
								title: '小',
								value: 'small',
							},
						],
					},
				},
				defaultValue: 'middle',
			},
			{
				name: 'minRows',
				title: '最小行数',
				setter: 'NumberSetter',
				defaultValue: 3,
			},
			{
				name: 'maxRows',
				title: '最大行数',
				setter: 'NumberSetter',
				defaultValue: 3,
			},
		],
		supports: {
			style: true,
			events: [
				{
					name: 'onChange',
					template:
						"onChange(event,${extParams}){\n// 输入框内容变化时的回调\nconsole.log('onChange',event);}",
				},
				{
					name: 'onPressEnter',
					template:
						"onPressEnter(event,${extParams}){\n// 按下回车的回调\nconsole.log('onPressEnter',event);}",
				},
				{
					name: 'onResize',
					template:
						"onResize({width,height},${extParams}){\n// resize 回调\nconsole.log('onResize',width,height);}",
				},
				{
					name: 'onFocus',
					template:
						"onFocus(event,${extParams}){\n// 获取焦点回调\nconsole.log('onFocus',event);}",
				},
				{
					name: 'onKeyDown',
					template:
						"onKeyDown(event,${extParams}){\n// 按键按下时的回调\nconsole.log('onKeyDown',event);}",
				},
				{
					name: 'onKeyPress',
					template:
						"onKeyPress(event,${extParams}){\n// 按键按下后的回调\nconsole.log('onKeyPress',event);}",
				},
				{
					name: 'onKeyUp',
					template:
						"onKeyUp(event,${extParams}){\n// 按键释放回调\nconsole.log('onKeyUp',event);}",
				},
				{
					name: 'onBlur',
					template:
						"onBlur(event,${extParams}){\n// 按键释放回调\nconsole.log('onBlur',event);}",
				},
			],
		},
	},
};
