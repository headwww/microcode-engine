import { computed, defineComponent } from 'vue';
import { Popover, Input } from 'ant-design-vue';
import './index.scss';
import { Sketch } from '@ckpack/vue-color';

export const ColorSetter = defineComponent({
	name: 'ColorSetter',
	props: {
		value: {
			type: String,
		},
		defaultValue: {
			type: String,
		},
	},
	emits: ['change'],
	setup(props, { emit }) {
		const setterValue = computed({
			get() {
				return props.value || props.defaultValue || '';
			},
			set(val: string) {
				emit('change', val);
			},
		});

		// 颜色选择器内容
		const colorPicker = () => (
			<div class="color-picker-container">
				<Sketch
					modelValue={setterValue.value}
					onUpdate:modelValue={handleColorChange}
				/>
			</div>
		);

		const handleColorChange = (color: any) => {
			const { rgba, hex } = color;
			const { r, g, b, a } = rgba;
			if (a === 1) {
				setterValue.value = hex;
			} else {
				setterValue.value = `rgba(${r},${g},${b},${a})`;
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
							value={setterValue.value}
							allowClear
							onUpdate:value={(v) => {
								setterValue.value = v;
							}}
							prefix={
								<div
									class="color-box"
									style={{ backgroundColor: setterValue.value }}
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
