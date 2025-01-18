import { ElButton, ElInput } from 'element-plus';
import { defineComponent } from 'vue';

export const TestButton = defineComponent({
	name: 'TestButton',
	props: {
		title: {
			type: String,
			default: '组合控件',
		},
	},
	setup(props) {
		return () => (
			<div>
				<ElInput></ElInput>
				<ElButton type="primary">{props.title}</ElButton>
			</div>
		);
	},
});
