import { Button as AButton } from 'ant-design-vue';
import { defineComponent } from 'vue';

export const TestButton = defineComponent({
	name: 'TestButton',
	props: {
		title: {
			type: String,
			default: '按钮',
		},
	},
	setup(props) {
		return () => <AButton type="primary">{props.title}</AButton>;
	},
});
