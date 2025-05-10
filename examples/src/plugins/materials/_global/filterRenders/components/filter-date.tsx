import {
	Alert,
	InputGroup,
	DatePicker,
	RadioGroup,
	Select,
} from 'ant-design-vue';
import { computed, defineComponent, PropType } from 'vue';
import {
	ComparisonOperator,
	FilterData,
	LogicalOperators,
	plainOptions,
} from '../types';

export default defineComponent({
	name: 'LtFilterDate',
	emits: ['update:value'],
	props: {
		value: {
			type: Object as PropType<FilterData>,
			default: () => ({
				logicalOperators: LogicalOperators.AND,
				firstQueryCondition: ComparisonOperator.EQUALS,
				firstQueryText: '',
				secondQueryCondition: ComparisonOperator.EMPTY,
				secondQueryText: '',
			}),
		},
	},
	setup(props, { emit }) {
		const logicalOperators = computed({
			get() {
				return props.value.logicalOperators;
			},
			set(value: LogicalOperators) {
				emit('update:value', { ...props.value, logicalOperators: value });
			},
		});

		const firstQueryCondition = computed({
			get() {
				return props.value.firstQueryCondition || ComparisonOperator.INCLUDE;
			},
			set(value: ComparisonOperator) {
				emit('update:value', { ...props.value, firstQueryCondition: value });
			},
		});

		const firstQueryText = computed({
			get() {
				return props.value.firstQueryText;
			},
			set(value: string) {
				emit('update:value', { ...props.value, firstQueryText: value });
			},
		});

		const secondQueryCondition = computed({
			get() {
				return props.value.secondQueryCondition || ComparisonOperator.EMPTY;
			},
			set(value: ComparisonOperator) {
				emit('update:value', { ...props.value, secondQueryCondition: value });
			},
		});

		const secondQueryText = computed({
			get() {
				return props.value.secondQueryText;
			},
			set(value: string) {
				emit('update:value', { ...props.value, secondQueryText: value });
			},
		});

		return () => (
			<div style="display: flex; flex-direction: column; gap: 12px">
				<Alert
					type="info"
					message="提示：条件一为必选项、条件二为辅助筛选"
					banner
				/>

				<InputGroup compact>
					<Select v-model:value={firstQueryCondition.value} style="width: 35%">
						{Object.values(ComparisonOperator).map((operator) => (
							<Select.Option key={operator} value={operator}>
								{operator === ComparisonOperator.EMPTY ? '' : operator}
							</Select.Option>
						))}
					</Select>
					<DatePicker
						v-model:value={firstQueryText.value}
						style="width: 65%"
						placeholder="请输入条件一"
					/>
				</InputGroup>

				<RadioGroup
					v-model:value={logicalOperators.value}
					options={plainOptions}
				/>

				<InputGroup compact>
					<Select v-model:value={secondQueryCondition.value} style="width: 35%">
						{Object.values(ComparisonOperator).map((operator) => (
							<Select.Option key={operator} value={operator}>
								{operator === ComparisonOperator.EMPTY ? '' : operator}
							</Select.Option>
						))}
					</Select>
					<DatePicker
						v-model:value={secondQueryText.value}
						style="width: 65%"
						placeholder="请输入条件二"
					/>
				</InputGroup>
			</div>
		);
	},
});
