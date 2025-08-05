import { computed, defineComponent, ref } from 'vue';
import { Select } from 'ant-design-vue';
import { http } from '../../../../utils/http';

export const TargetClassSetter = defineComponent({
	name: 'TargetClassSetter',
	emits: ['change'],
	props: {
		value: {
			type: String,
		},
	},
	setup(props, { emit }) {
		const options = ref<Array<{ label: string; value: string }>>([]);

		const selectValue = computed({
			get() {
				return props.value;
			},
			set(v) {
				emit('change', v);
			},
		});

		// api/bsEntityService/getAllModel  获取所有实体

		const dropdownVisibleChange = () => {
			if (options.value.length === 0) {
				http
					.get<
						{
							classComment?: string;
							classPath?: string;
						}[]
					>({
						url: 'api/bsEntityService/getAllModel',
						data: [],
					})
					.then((res) => {
						options.value = res.map((item) => ({
							label: `${item.classComment}(${item.classPath})` || '',
							value: item.classPath || '',
						}));
					});
			}
		};

		return () => (
			<Select
				v-model:value={selectValue.value}
				onDropdownVisibleChange={dropdownVisibleChange}
				options={options.value}
				showSearch
				placeholder={'请选择'}
				dropdownStyle={{ minWidth: '500px' }}
				placement={'bottomRight'}
				popupMatchSelectWidth={false}
				filterOption={(inputValue: string, treeNode: any) =>
					treeNode?.label?.toLowerCase().includes(inputValue.toLowerCase()) ||
					treeNode?.value?.toLowerCase().includes(inputValue.toLowerCase())
				}
				style={{ width: '100%' }}
			/>
		);
	},
});
