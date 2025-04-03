import { defineComponent, PropType } from 'vue';
import { Select } from 'ant-design-vue';
import { IPublicModelSettingField } from '@arvin-shu/microcode-types';

// 定义接口
interface SelectOption {
	title?: string;
	label?: string;
	value: string | number;
	disabled?: boolean;
	children?: SelectOption[];
}

// 格式化选项的工具函数
const formatOptions = (options: SelectOption[]) =>
	options.map((item: SelectOption) => {
		if (item.children) {
			const children = item.children.map((child: SelectOption) => ({
				label: child.title || child.label || '-',
				value: child.value,
				disabled: child.disabled || false,
			}));
			return {
				label: item.title || item.label || '-',
				children,
			};
		}
		return {
			label: item.title || item.label || '-',
			value: item.value,
			disabled: item.disabled || false,
		};
	});

export const SelectSetter = defineComponent({
	name: 'SelectSetter',
	inheritAttrs: false,
	props: {
		value: {
			type: [String, Number, Array] as PropType<
				string | number | (string | number)[]
			>,
		},
		mode: {
			type: String as PropType<'multiple' | 'tags' | undefined>,
		},
		defaultValue: {
			type: [String, Number, Array] as PropType<
				string | number | (string | number)[]
			>,
			default: null,
		},
		options: {
			type: Array as PropType<SelectOption[]>,
			default: () => [{ label: '-', value: '' }],
		},
		showSearch: {
			type: Boolean,
			default: false,
		},
		hasClear: {
			type: Boolean,
			default: true,
		},
		onChange: {
			type: Function as PropType<(value: any) => void>,
			default: () => undefined,
		},
		field: {
			type: Object as PropType<IPublicModelSettingField>,
		},
	},

	setup(props) {
		return () => (
			<Select
				value={props.value}
				mode={props.mode}
				options={formatOptions(props.options)}
				onChange={(val: any) => props.onChange?.(val || null)}
				showSearch={props.showSearch}
				allowClear={props.hasClear}
				style={{ width: '100%' }}
			/>
		);
	},
});
