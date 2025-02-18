import { Input, Select, InputGroup } from 'ant-design-vue';
import { defineComponent, ref } from 'vue';

export const DataSourceFilter = defineComponent({
	name: 'DataSourceFilter',
	inheritAttrs: false,
	setup() {
		const selectValue = ref('ALL');

		return () => (
			<InputGroup style={{ padding: ' 10px 10px 0 10px' }} compact>
				<Select
					style={{ width: '32%' }}
					value={selectValue.value}
					onUpdate:value={(value) => {
						selectValue.value = value as string;
					}}
				>
					<Select.Option value="ALL">全部</Select.Option>
					<Select.Option value="GET">GET</Select.Option>
					<Select.Option value="POST">POST</Select.Option>
					<Select.Option value="PUT">PUT</Select.Option>
					<Select.Option value="DELETE">DELETE</Select.Option>
				</Select>
				<Input allowClear placeholder="筛选" style={{ width: '68%' }}></Input>
			</InputGroup>
		);
	},
});
