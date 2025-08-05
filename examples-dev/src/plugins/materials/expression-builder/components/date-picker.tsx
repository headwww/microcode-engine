import { DatePicker } from 'ant-design-vue';
import dayjs from 'dayjs';
import { computed, defineComponent, PropType } from 'vue';

export default defineComponent({
	name: 'ExprDatePicker',
	props: {
		value: {
			type: Number as PropType<number>,
		},
	},
	emits: ['update:value'],
	setup(props, { emit }) {
		const timeStamp = computed({
			get() {
				return props.value ? dayjs(props.value) : undefined;
			},
			set(v) {
				emit('update:value', v?.valueOf());
			},
		});

		return () => (
			<DatePicker
				format={'YYYY-MM-DD HH:mm:ss'}
				showTime
				v-model:value={timeStamp.value}
			/>
		);
	},
});
