import { Textarea } from 'ant-design-vue';
import { computed, defineComponent } from 'vue';

export const TextareaSetter = defineComponent({
	name: 'TextareaSetter',
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
				<Textarea
					placeholder={placeholder || ''}
					v-model:value={value.value}
					style={{ width: '100%' }}
				/>
			);
		};
	},
});
