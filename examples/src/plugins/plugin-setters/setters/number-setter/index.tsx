import { InputNumber } from 'ant-design-vue';
import { computed, defineComponent } from 'vue';

export const NumberSetter = defineComponent({
	name: 'NumberSetter',
	emits: ['change'],
	props: {
		value: String,
		defaultValue: String,
		placeholder: String,
		min: {
			type: Number,
			default: Number.MIN_SAFE_INTEGER,
		},
		max: {
			type: Number,
			default: Number.MAX_SAFE_INTEGER,
		},
		step: {
			type: Number,
			default: 1,
		},
		precision: {
			type: Number,
			default: 0,
		},
		prefix: String,
		suffix: String,
	},
	inheritAttrs: false,
	setup(props, { emit }) {
		const value = computed({
			get() {
				return props.value;
			},
			set(val: string) {
				emit('change', !val ? 0 : val);
			},
		});
		return () => {
			const { placeholder, min, max, step, precision, prefix, suffix } = props;

			return (
				<InputNumber
					min={min}
					max={max}
					step={step}
					precision={precision}
					prefix={prefix}
					suffix={suffix}
					placeholder={placeholder || ''}
					v-model:value={value.value}
					style={{ width: '100%' }}
				/>
			);
		};
	},
});
