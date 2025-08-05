import { defineComponent, PropType } from 'vue';
import { Popover, Input } from 'ant-design-vue';
import { Sketch } from '@ckpack/vue-color';
import { StyleData } from '../../types';

export const ColorInput = defineComponent({
	name: 'ColorInput',
	props: {
		styleKey: {
			type: String,
			default: '',
		},
		styleData: {
			type: Object as PropType<StyleData | any>,
			default: () => ({}),
		},
		onStyleChange: {
			type: Function as PropType<(style: any) => void>,
		},
		inputWidth: {
			type: String,
		},
		color: null,
	},
	setup(props) {
		// 颜色选择器内容
		const colorPicker = () => {
			const color = props.color ? props.color : props.styleData[props.styleKey];
			return (
				<div class="color-picker-container">
					<Sketch
						modelValue={color || ''}
						onUpdate:modelValue={handleColorChange}
					/>
				</div>
			);
		};

		const handleColorChange = (color: any) => {
			const { onStyleChange, styleKey } = props;

			const { rgba, hex } = color;

			if (rgba) {
				const { r, g, b, a } = rgba;
				if (a === 1) {
					onStyleChange?.([
						{
							styleKey,
							value: hex,
						},
					]);
				} else {
					onStyleChange?.([
						{
							styleKey,
							value: `rgba(${r},${g},${b},${a})`,
						},
					]);
				}
			} else {
				onStyleChange?.([
					{
						styleKey,
						value: null,
					},
				]);
			}
		};

		return () => (
			<Popover
				destroyTooltipOnHide
				trigger="click"
				overlayInnerStyle={{ padding: '0px' }}
			>
				{{
					default: () => (
						<Input
							class="mtc-setter-color"
							value={
								props.color ? props.color : props.styleData[props.styleKey]
							}
							allowClear
							onUpdate:value={(v: any) => {
								handleColorChange(v);
							}}
							prefix={
								<div
									class="color-box"
									style={{
										backgroundColor: props.color
											? props.color
											: props.styleData[props.styleKey],
									}}
								></div>
							}
						/>
					),
					content: () => colorPicker(),
				}}
			</Popover>
		);
	},
});
