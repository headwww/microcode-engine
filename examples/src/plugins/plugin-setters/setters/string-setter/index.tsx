import { Input } from 'ant-design-vue';
import { computed, defineComponent } from 'vue';

export const StringSetter = defineComponent({
	name: 'StringSetter',
	emits: ['change'],
	props: {
		value: String,
		defaultValue: String,
		placeholder: String,
	},
	inheritAttrs: false,
	setup(props, { emit }) {
		const value = computed({
			get() {
				return props.value;
			},
			set(val: string) {
				emit('change', val);
			},
		});
		return () => {
			const { placeholder } = props;

			return (
				<Input
					placeholder={placeholder || ''}
					v-model:value={value.value}
					style={{ width: '100%' }}
				/>
			);
		};
	},
});
