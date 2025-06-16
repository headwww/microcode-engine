import { defineComponent, inject } from 'vue';
import { Button as AntButton } from 'ant-design-vue';

export default defineComponent({
	name: 'LtButton',
	props: {
		href: {
			type: String,
			default: '',
		},
	},
	setup(props, { slots }) {
		const innerProps: Record<string, any> = {};
		const designMode = inject<string>('__designMode', 'live');

		if (!props.href?.trim() || designMode === 'design') {
			// 解决低代码编辑器中按钮设置href属性造成按钮点击重定向问题
			innerProps.href = undefined;
		}

		return () => <AntButton {...innerProps}>{slots.default?.()}</AntButton>;
	},
});
