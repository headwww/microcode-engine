import { InputGroup, InputNumber } from 'ant-design-vue';
import { get } from 'lodash-es';
import { computed, defineComponent, PropType } from 'vue';

export default defineComponent({
	name: 'ExprInputNumberGroup',
	emits: ['update:value'],
	props: {
		value: {
			type: Array as PropType<Array<number>>,
		},
	},
	setup(props, { emit }) {
		const v1 = computed({
			get() {
				return get(props.value, '0');
			},
			set(v) {
				emit('update:value', [v, get(props.value, '1')]);
			},
		});
		const v2 = computed({
			get() {
				return get(props.value, '1');
			},
			set(v) {
				emit('update:value', [get(props.value, '0'), v]);
			},
		});
		return () => (
			<InputGroup compact>
				<InputNumber v-model:value={v1.value} style="width: 50%" />
				<InputNumber v-model:value={v2.value} style="width: 50%" />
			</InputGroup>
		);
	},
});
