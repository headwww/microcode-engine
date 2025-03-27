import { defineComponent, PropType } from 'vue';
import { Segmented } from 'ant-design-vue';

export const SegmentedSetter = defineComponent({
	name: 'SegmentedSetter',
	inheritAttrs: false,
	props: {
		value: {
			type: [String, Number],
			default: () => '',
		},
		options: {
			type: Array as PropType<any[]>,
			default: () => [],
		},
		block: {
			type: Boolean,
			default: true, // 默认撑满容器宽度
		},
		onChange: {
			type: Function as PropType<(value: any) => void>,
			default: () => undefined,
		},
	},

	setup(props) {
		return () => (
			<Segmented
				value={props.value}
				options={props.options}
				block={props.block}
				onChange={(val: any) => props.onChange?.(val)}
			/>
		);
	},
});
