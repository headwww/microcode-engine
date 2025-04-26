import { Popover, Tag, Tooltip, TreeSelect } from 'ant-design-vue';
import { defineComponent, ref, PropType, computed } from 'vue';
import { Icon } from 'vxe-pc-ui';
import { http } from '../../../utils/http';
import { FieldListByClass, PropertySelectorValue } from './types';
import './style.scss';

export default defineComponent({
	name: 'LtPropertySelector',
	emits: ['change', 'update:value'],
	props: {
		value: {
			type: Object as PropType<PropertySelectorValue>,
		},
	},
	setup(props, { emit }) {
		const selectedValue = ref();

		const treeData = ref<any[]>([]);
		// 添加选中值的响应式引用
		const selectedNode = computed({
			get() {
				// eslint-disable-next-line vue/no-side-effects-in-computed-properties
				selectedValue.value = props.value?.fieldName;
				return props.value;
			},
			set(value) {
				emit('change', value);
				emit('update:value', value);
			},
		});

		const getFieldListByClass = (className: string) =>
			http.post<FieldListByClass[]>({
				url: 'api/testServiceImpl/getFieldListByClass',
				data: [
					[
						{
							className,
						},
					],
				],
			});

		const onLoadData = (treeNode: any) =>
			new Promise((resolve) => {
				getFieldListByClass(treeNode.fieldType).then((res) => {
					const tree = res.map((item: any) => {
						const id = treeNode.id.concat('.').concat(item.fieldName);
						return {
							id,
							value: id,
							pId: treeNode.dataRef.id,
							title: `${item.fieldName}  (${item.fieldCommnet})`,
							fieldType: item.fieldType,
							isLeaf: item.fieldTypeFlag !== '1',
							disabled: item.fieldTypeFlag === '1',
							fieldTypeFlag: item.fieldTypeFlag,
							fieldName: id,
							enumInfo: item.enumInfo,
							parentFieldType: treeNode.dataRef?.fieldType,
							topFieldType: treeNode.dataRef?.topFieldType,
							topFieldTypeFlag: treeNode.dataRef?.fieldTypeFlag,
						};
					});
					treeData.value = treeData.value?.concat(tree);
					resolve(true);
				});
			});

		const getTreeData = () => {
			getFieldListByClass(selectedNode.value?.targetClass || '').then((res) => {
				treeData.value = res?.map((item) => ({
					id: item.fieldName,
					pId: 0,
					value: item.fieldName,
					title: `${item.fieldName}  (${item.fieldCommnet})`,
					isLeaf: item.fieldTypeFlag !== '1',
					disabled: item.fieldTypeFlag === '1',
					fieldType: item.fieldType,
					fieldTypeFlag: item.fieldTypeFlag,
					enumInfo: item.enumInfo,
					topFieldType: item.fieldType,
					topFieldTypeFlag: item.fieldTypeFlag,
				}));
			});
		};

		const dropdownVisibleChange = () => {
			if (treeData.value.length === 0) {
				if (selectedNode.value?.targetClass) {
					getTreeData();
				}
			}
		};

		// 添加选择变化的处理函数
		const handleSelect = (v: any) => {
			const findNode = treeData.value?.find((item: any) => item.id === v);
			selectedNode.value = {
				targetClass: selectedNode.value?.targetClass || '',
				fieldTypeFlag: findNode?.fieldTypeFlag,
				enumInfo: findNode?.enumInfo,
				topFieldType: findNode?.topFieldType,
				fieldType: findNode?.fieldType,
				fieldName: findNode?.id,
				topFieldTypeFlag: findNode?.topFieldTypeFlag,
			};
		};
		const renderPropertyInfo = () => {
			const topEntityLength =
				selectedNode.value?.fieldName?.split('.').length || 0;

			const fieldTypeFlag = selectedNode.value?.fieldTypeFlag;

			const enumInfo = selectedNode.value?.enumInfo
				?.map((item: any) => `{${item.key}:${item.value}}`)
				.join(',');

			return (
				<div class="lt-property-info">
					<div class={['lt-property-item', 'lt-property-type-dot']}>
						<div class="lt-property-item-label-wrapper">
							<span class="lt-property-item-label">所选属性类型</span>
							<Tag color={fieldTypeFlag === '0' ? 'blue' : 'green'}>
								{fieldTypeFlag === '0'
									? '基础类型'
									: fieldTypeFlag === '1'
										? '实体类型'
										: '枚举类型'}
							</Tag>
						</div>
						<Tooltip title={enumInfo}>
							<span class="lt-property-item-value">
								{selectedNode.value?.fieldType}
							</span>
						</Tooltip>
					</div>
					{topEntityLength > 1 && (
						<div class={['lt-property-item', 'lt-top-entity-dot']}>
							<span class="lt-property-item-label">顶级属性类型</span>
							<span class="lt-property-item-value">
								{selectedNode.value?.topFieldType}
							</span>
						</div>
					)}
				</div>
			);
		};

		return () => (
			<div style={{ position: 'relative' }}>
				<TreeSelect
					v-model:value={selectedValue.value}
					treeData={treeData.value}
					showSearch
					disabled={!selectedNode.value?.targetClass}
					height="400"
					popupMatchSelectWidth={false}
					placeholder={'请选择'}
					loadData={onLoadData}
					treeLine={true && { showLeafIcon: false }}
					treeDataSimpleMode
					suffixIcon={<i></i>}
					style={{ width: '100%' }}
					dropdownStyle={{
						minWidth: '300px',
						maxWidth: '400px',
					}}
					treeNodeLabelProp="value"
					filterTreeNode={(inputValue: string, treeNode: any) =>
						treeNode?.title?.toLowerCase().includes(inputValue.toLowerCase()) ||
						treeNode?.value?.toLowerCase().includes(inputValue.toLowerCase())
					}
					onDropdownVisibleChange={dropdownVisibleChange}
					onSelect={handleSelect} // 添加选择事件处理
				/>
				<Popover
					destroyTooltipOnHide
					arrow={false}
					placement="bottom"
					content={renderPropertyInfo()}
				>
					<Icon
						name="warning-circle"
						style={{
							color: 'rgba(0, 0, 0, 0.25)',
							lineHeight: '32px',
							cursor: 'pointer',
							position: 'absolute',
							right: '6px',
							top: '0',
						}}
					/>
				</Popover>
			</div>
		);
	},
});
