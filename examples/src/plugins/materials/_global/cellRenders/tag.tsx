import { defineComponent, Fragment } from 'vue';
import { Tag } from 'ant-design-vue';

export default defineComponent({
	componentName: 'LtTagRenderTableCell',
	props: {
		color: String,
		value: null,
	},
	setup(props) {
		return () => (
			<Fragment>
				{props.value === undefined || props.value === null ? (
					<span>{props.value}</span>
				) : (
					<Tag color={props.color || 'default'}>{props.value}</Tag>
				)}
			</Fragment>
		);
	},
});
