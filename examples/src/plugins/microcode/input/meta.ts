import snippets from './snippets';

export default {
	snippets,
	componentName: 'Input',
	title: '输入框',
	category: '表单',
	group: '基础组件',
	npm: {
		package: 'ArvinMicrocode',
		destructuring: true,
		exportName: 'Input',
		version: '1.0.0',
	},
	configure: {
		props: [
			{
				name: 'defaultValue',
				title: { label: '默认值', tip: '默认内容' },
				propType: 'string',
				setter: 'StringSetter',
			},
			{
				name: 'v-model:value',
				title: '输入值',
				setter: 'StringSetter',
			},
			{
				name: 'allowClear',
				title: { label: '支持清除', tip: '是否允许清除' },
				setter: 'BoolSetter',
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
				name: 'maxLength',
				title: { label: '最大长度', tip: '最大长度' },
				setter: {
					componentName: 'NumberSetter',
					props: {
						min: 0,
					},
				},
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
				name: 'addonAfter',
				title: { label: '后置标签', tip: '后置标签' },
				setter: 'StringSetter',
			},
			{
				name: 'addonBefore',
				title: { label: '前置标签', tip: '前置标签' },
				setter: 'StringSetter',
			},
			{
				name: 'prefix',
				title: { label: '前缀', tip: '前缀' },
				setter: 'StringSetter',
			},
			{
				name: 'suffix',
				title: { label: '后缀', tip: '后缀' },
				setter: 'StringSetter',
			},
		],
		supports: {
			style: true,
			events: [
				{
					name: 'onChange',
					template:
						"onChange(event,${extParams}){\n// 输入框内容变化时的回调\nconsole.log('onChange',event);\n}",
				},
				{
					name: 'onPressEnter',
					template:
						"onPressEnter(event,${extParams}){\n// 按下回车的回调\nconsole.log('onPressEnter',event);\n}",
				},
				{
					name: 'onFocus',
					template:
						"onFocus(event,${extParams}){\n// 获取焦点回调\nconsole.log('onFocus',event);\n}",
				},
				{
					name: 'onKeyDown',
					template:
						"onKeyDown(event,${extParams}){\n// 按键按下时的回调\nconsole.log('onKeyDown',event);\n}",
				},
				{
					name: 'onKeyPress',
					template:
						"onKeyPress(event,${extParams}){\n// 按键按下后的回调\nconsole.log('onKeyPress',event);\n}",
				},
				{
					name: 'onKeyUp',
					template:
						"onKeyUp(event,${extParams}){\n// 按键释放回调\nconsole.log('onKeyUp',event);\n}",
				},
				{
					name: 'onBlur',
					template:
						"onBlur(event,${extParams}){\n// 按键释放回调\nconsole.log('onBlur',event);\n}",
				},
			],
		},
	},
};
