import { Input, InputGroup } from 'ant-design-vue';
import { get } from 'lodash-es';
import { computed, defineComponent, PropType } from 'vue';

export default defineComponent({
	name: 'ExprInputGroup',
	emits: ['update:value'],
	props: {
		value: {
			type: Array as PropType<Array<string>>,
			default: () => ['', ''],
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
				<Input v-model:value={v1.value} style="width: 50%" />
				<Input v-model:value={v2.value} style="width: 50%" />
			</InputGroup>
		);
	},
});
