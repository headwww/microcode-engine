import { defineComponent, PropType, ref, watch } from 'vue';
import { InputNumber, Select } from 'ant-design-vue';
import { StyleData } from '../../types';

const UNITS = ['px', 'rem', 'em', '%', 'vw', 'vh'];

export const UnitInput = defineComponent({
	name: 'UnitInput',
	props: {
		styleKey: {
			type: String,
			required: true,
		},
		styleData: {
			type: Object as PropType<StyleData | any>,
			default: () => ({}),
		},
		onStyleChange: {
			type: Function as PropType<(style: StyleData[]) => void>,
			default: () => {},
		},
		min: {
			type: Number,
			default: -Infinity,
		},
		max: {
			type: Number,
			default: Infinity,
		},
		enableUnit: {
			type: Boolean,
			default: true,
		},
		size: {
			type: String as PropType<any>,
			default: 'default',
		},
	},
	setup(props) {
		// 解析初始值和单位
		const parseValueAndUnit = (value: string | number) => {
			if (!value) return { num: null, unit: 'px' };
			if (!props.enableUnit) return { num: Number(value), unit: 'px' };

			const match = String(value).match(/^(-?\d+\.?\d*)(px|rem|em|%|vw|vh)$/);
			return match
				? { num: parseFloat(match[1]), unit: match[2] }
				: { num: null, unit: 'px' };
		};

		const initialValue = props.styleData[props.styleKey];

		watch(
			() => props.styleKey,
			(newVal) => {
				const { num: initialNum, unit: initialUnit } = parseValueAndUnit(
					props.styleData[newVal]
				);
				numberValue.value = initialNum;
				unitValue.value = initialUnit;
			}
		);

		const { num: initialNum, unit: initialUnit } =
			parseValueAndUnit(initialValue);

		const numberValue = ref<any>(initialNum);
		const unitValue = ref(initialUnit);

		// 组合最终值
		const updateStyle = () => {
			if (numberValue.value === null) {
				props.onStyleChange([{ styleKey: props.styleKey, value: null }]);
				return;
			}
			const value = props.enableUnit
				? `${numberValue.value}${unitValue.value}`
				: numberValue.value;
			props.onStyleChange([{ styleKey: props.styleKey, value }]);
		};

		return () => (
			<InputNumber
				value={numberValue.value}
				min={props.min}
				max={props.max}
				style="width: 100%"
				size={props.size}
				onUpdate:value={(value: any) => {
					numberValue.value = value;
					updateStyle();
				}}
				addonAfter={
					props.enableUnit ? (
						<Select
							size={props.size}
							value={unitValue.value}
							onUpdate:value={(value: any) => {
								unitValue.value = value;
								updateStyle();
							}}
						>
							{UNITS.map((unit) => (
								<Select.Option key={unit} value={unit}>
									{unit}
								</Select.Option>
							))}
						</Select>
					) : null
				}
			/>
		);
	},
});
