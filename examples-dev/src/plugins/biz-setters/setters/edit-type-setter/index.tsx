import { Select } from 'ant-design-vue';
import { computed, defineComponent } from 'vue';

/**
 * 用于指定字段是使用文本框、下拉框、日期选择器等或者实体选择器哪种组件来编辑的。
 */
export const EditTypeSetter = defineComponent({
	name: 'LtEditTypeSetter',
	emits: ['change', 'update:value'],
	props: {
		value: null,
		placeholder: {
			type: String,
			default: '请选择',
		},
	},
	setup(props, { emit }) {
		const selectValue = computed({
			get() {
				return props.value;
			},
			set(v) {
				const option = options.value.find((item) => item.value === v);
				emit('change', option.value);
				emit('update:value', v);
			},
		});

		const options = computed(() => {
			// TODO 从本地缓存中获取实体选择器的配置，以后项目中需要优化先这样写着
			const entitySelector = JSON.parse(
				localStorage.getItem('entity-selector-config') || '[]'
			);
			const options = entitySelector.map((item: any) => ({
				...item,
				label: item.keyWords,
				value: item.id,
			}));

			return [
				{
					label: '禁用编辑',
					value: 'disabledEdit',
				},
				{
					label: '文本',
					value: 'text',
				},
				{
					label: '数字',
					value: 'number',
				},
				{
					label: '布尔选择器',
					value: 'boolean',
				},
				{
					label: '下拉选择器',
					value: 'select',
				},
				{
					label: '日期选择器',
					value: 'date',
				},
				{
					label: '时间选择器',
					value: 'time',
				},
				{
					label: '自定义实体选择器',
					value: 'customEntity',
				},
				...options,
			];
		});

		return () => (
			<Select
				v-model:value={selectValue.value}
				showSearch
				allowClear
				options={options.value}
				placeholder={props.placeholder}
				popupMatchSelectWidth={false}
				style={{ width: '100%' }}
				dropdownStyle={{ minWidth: '300px' }}
				filterOption={(inputValue: string, treeNode: any) =>
					treeNode?.label?.toLowerCase().includes(inputValue.toLowerCase()) ||
					treeNode?.value?.toLowerCase().includes(inputValue.toLowerCase())
				}
			>
				{props.value}
			</Select>
		);
	},
});
