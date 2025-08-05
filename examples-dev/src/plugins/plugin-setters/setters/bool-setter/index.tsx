import { Switch } from 'ant-design-vue';
import { computed, defineComponent } from 'vue';

export const BoolSetter = defineComponent({
	name: 'BoolSetter',
	emits: ['change'],
	props: {
		value: Boolean,
		disabled: Boolean,
		defaultValue: Boolean,
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
			const { disabled } = props;
			return <Switch v-model:checked={value.value} disabled={disabled} />;
		};
	},
});
