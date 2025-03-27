import { defineComponent, PropType } from 'vue';
import { Radio } from 'ant-design-vue';

interface Option {
	label?: string;
	value?: any;
	title?: string;
}

export const RadioGroupSetter = defineComponent({
	name: 'RadioGroupSetter',
	inheritAttrs: false,
	props: {
		value: {
			type: null,
		},
		disabled: {
			type: Boolean,
			default: false,
		},
		options: {
			type: Array as PropType<(Option | string)[]>,
			required: true,
		},
		onChange: {
			type: Function as PropType<(val: any) => void>,
			required: true,
		},
	},
	setup(props) {
		const dataSource = props.options.map((item: Option | string) => {
			if (typeof item === 'string') {
				return {
					label: item,
					value: item,
				};
			}
			return {
				label: item.title || item.label,
				value: item.value,
			};
		});

		return () => (
			<Radio.Group
				value={props.value}
				disabled={props.disabled}
				onChange={(e: any) => props.onChange(e.target.value)}
			>
				{dataSource.map((item) => (
					<Radio.Button value={item.value}>{item.label}</Radio.Button>
				))}
			</Radio.Group>
		);
	},
});
