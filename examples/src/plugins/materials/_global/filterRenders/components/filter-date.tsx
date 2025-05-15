import {
	Alert,
	InputGroup,
	DatePicker,
	RadioGroup,
	Select,
	TimePicker,
} from 'ant-design-vue';
import { computed, defineComponent, PropType } from 'vue';
import dayjs from 'dayjs';
import {
	TemporalOperator,
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
				firstQueryCondition: TemporalOperator.EQUALS,
				firstQueryText: '',
				secondQueryCondition: TemporalOperator.EMPTY,
				secondQueryText: '',
			}),
		},
		dateType: {
			type: String,
			default: 'date',
		},
		timeFormatter: {
			type: String,
			default: 'HH:mm:ss',
		},
		dateFormatter: {
			type: String,
			default: 'YYYY-MM-DD HH:mm:ss',
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
				return props.value.firstQueryCondition || TemporalOperator.EQUALS;
			},
			set(value: TemporalOperator) {
				emit('update:value', { ...props.value, firstQueryCondition: value });
			},
		});

		const firstQueryText = computed({
			get() {
				return props.value.firstQueryText
					? dayjs(
							props.value.firstQueryText,
							props.dateType === 'date'
								? props.dateFormatter
								: props.timeFormatter
						)
					: '';
			},
			set(value: string) {
				emit('update:value', {
					...props.value,
					firstQueryText: dayjs(value).format(
						props.dateType === 'date'
							? props.dateFormatter
							: props.timeFormatter
					),
				});
			},
		});

		const secondQueryCondition = computed({
			get() {
				return props.value.secondQueryCondition || TemporalOperator.EMPTY;
			},
			set(value: TemporalOperator) {
				emit('update:value', { ...props.value, secondQueryCondition: value });
			},
		});

		const secondQueryText = computed({
			get() {
				return props.value.secondQueryText
					? dayjs(
							props.value.secondQueryText,
							props.dateType === 'date'
								? props.dateFormatter
								: props.timeFormatter
						)
					: '';
			},
			set(value: string) {
				emit('update:value', {
					...props.value,
					secondQueryText: dayjs(value).format(
						props.dateType === 'date'
							? props.dateFormatter
							: props.timeFormatter
					),
				});
			},
		});

		const picker = getPickerType(props.dateFormatter);

		const showTime = showTimeFormat(props.dateFormatter);

		return () => (
			<div style="display: flex; flex-direction: column; gap: 12px">
				<Alert
					type="info"
					message="提示：条件一为必选项、条件二为辅助筛选"
					banner
				/>

				<InputGroup compact>
					<Select v-model:value={firstQueryCondition.value} style="width: 35%">
						{Object.values(TemporalOperator).map((operator) => (
							<Select.Option key={operator} value={operator}>
								{operator === TemporalOperator.EMPTY ? '' : operator}
							</Select.Option>
						))}
					</Select>
					{props.dateType === 'date' ? (
						<DatePicker
							picker={picker}
							showTime={showTime}
							format={props.dateFormatter}
							v-model:value={firstQueryText.value}
							style="width: 65%"
							placeholder="请选择日期"
						/>
					) : (
						<TimePicker
							format={props.timeFormatter}
							v-model:value={firstQueryText.value}
							style="width: 65%"
							placeholder="请选择时间"
						/>
					)}
				</InputGroup>

				<RadioGroup
					v-model:value={logicalOperators.value}
					options={plainOptions}
				/>

				<InputGroup compact>
					<Select v-model:value={secondQueryCondition.value} style="width: 35%">
						{Object.values(TemporalOperator).map((operator) => (
							<Select.Option key={operator} value={operator}>
								{operator === TemporalOperator.EMPTY ? '' : operator}
							</Select.Option>
						))}
					</Select>
					{props.dateType === 'date' ? (
						<DatePicker
							picker={picker}
							showTime={showTime}
							format={props.dateFormatter}
							v-model:value={secondQueryText.value}
							style="width: 65%"
							placeholder="请选择日期"
						/>
					) : (
						<TimePicker
							format={props.timeFormatter}
							v-model:value={secondQueryText.value}
							style="width: 65%"
							placeholder="请选择时间"
						/>
					)}
				</InputGroup>
			</div>
		);
	},
});

// 根据格式判断picker类型
const getPickerType = (format: string) => {
	if (format.includes('HH') || format.includes('时')) {
		return 'date'; // 如果包含时间，使用date类型
	}
	if (format === 'YYYY' || format === 'YYYY年') {
		return 'year';
	}
	if (format.includes('MM') || format.includes('月')) {
		if (!format.includes('DD') && !format.includes('日')) {
			return 'month';
		}
		return 'date';
	}
	return 'date';
};

// 判断是否显示时间选择
const showTimeFormat = (format: string) => {
	if (format.includes('HH') || format.includes('时')) {
		// 根据格式创建时间选择的配置
		return {
			format: format.split(' ')[1], // 获取时间部分的格式
		};
	}
	return false;
};
