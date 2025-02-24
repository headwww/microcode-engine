import { Input, Select, InputGroup } from 'ant-design-vue';
import { computed, defineComponent, PropType } from 'vue';

export interface IDataSourceFilter {
	method: string;
	keyword: string;
}

export const DataSourceFilter = defineComponent({
	name: 'DataSourceFilter',
	inheritAttrs: false,
	emits: ['update:filter'],
	props: {
		filter: {
			type: Object as PropType<IDataSourceFilter>,
			default: () => ({
				method: 'ALL',
				keyword: '',
			}),
		},
	},
	setup(props, { emit }) {
		const value = computed({
			get() {
				return props.filter;
			},
			set(value) {
				emit('update:filter', value);
			},
		});

		return () => (
			<InputGroup style={{ padding: ' 10px 10px 0 10px' }} compact>
				<Select
					style={{ width: '32%' }}
					value={value.value.method}
					onUpdate:value={(v) => {
						value.value = {
							...value.value,
							method: v as string,
						};
					}}
				>
					<Select.Option value="ALL">全部</Select.Option>
					<Select.Option value="GET">GET</Select.Option>
					<Select.Option value="POST">POST</Select.Option>
					<Select.Option value="PUT">PUT</Select.Option>
					<Select.Option value="DELETE">DELETE</Select.Option>
				</Select>
				<Input
					allowClear
					placeholder="筛选"
					style={{ width: '68%' }}
					value={value.value.keyword}
					onUpdate:value={(v) => {
						value.value = {
							...value.value,
							keyword: v as string,
						};
					}}
				></Input>
			</InputGroup>
		);
	},
});
