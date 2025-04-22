import { defineComponent } from 'vue';
import { Tag } from 'ant-design-vue';

export default defineComponent({
	componentName: 'LtTagRenderTableCell',
	props: {
		color: String,
	},
	setup(props, { slots }) {
		return () => (
			<Tag color={props.color || 'default'}>{slots.default?.()}</Tag>
		);
	},
});
