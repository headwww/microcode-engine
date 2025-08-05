import { RangePicker } from 'ant-design-vue';
import dayjs from 'dayjs';
import { computed, defineComponent, PropType } from 'vue';

export default defineComponent({
	name: 'ExprDatePickerGroup',
	props: {
		value: {
			type: Array as PropType<Array<number>>,
		},
	},
	emits: ['update:value'],
	setup(props, { emit }) {
		const timeStamp = computed({
			get() {
				return props.value
					? props.value?.map((item) => (item ? dayjs(item) : undefined))
					: [];
			},
			set(v) {
				emit(
					'update:value',
					v?.map((item) => item?.valueOf())
				);
			},
		});

		return () => (
			<RangePicker
				format={'YYYY-MM-DD HH:mm:ss'}
				showTime
				v-model:value={timeStamp.value}
			/>
		);
	},
});
