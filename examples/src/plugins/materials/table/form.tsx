import {
	computed,
	inject,
	nextTick,
	onMounted,
	reactive,
	ref,
	Ref,
	watch,
} from 'vue';
import { VxeGridInstance } from 'vxe-table';
import { VxeForm, VxeFormInstance, VxeFormProps } from 'vxe-pc-ui';
import { cloneDeep, isUndefined, omit } from 'lodash';
import { Button, Tabs, Tooltip } from 'ant-design-vue';
import {
	CloseOutlined,
	LeftOutlined,
	RightOutlined,
	RollbackOutlined,
	SwapOutlined,
} from '@ant-design/icons-vue';
import { eachTree, mapTree } from 'xe-utils';
import { FormItemProps, TableProps } from './types';

export function useTableForm(
	tableInstance: Ref<(VxeGridInstance & HTMLDivElement) | undefined>,
	props: TableProps
) {
	const formOptions = reactive<VxeFormProps>({
		data: {},
	});

	// 表格除去表头剩下的区域
	const tableWrapper = ref<HTMLDivElement>();
	// 表单容器
	const formWrapper = ref<HTMLDivElement>();

	const showForm = ref(false);

	const renderForm = () => (
		<div
			ref={formWrapper}
			style={{
				display: showForm.value ? 'block' : 'none',
				position: 'absolute',
				top: 0,
				left: 0,
				width: '100%',
				height: '100%',
				zIndex: 10,
				backgroundColor: 'white',
				padding: '6px',
				overflow: 'auto',
			}}
		>
			<Tabs size="small">
				{formTabs.value.map((tab) => (
					<Tabs.TabPane tab={tab?.title} key={tab.id}>
						<VxeForm
							ref={(el: VxeFormInstance) => {
								if (el) {
									formRefs.value[tab.id] = el;
								}
							}}
							{...props.formConfig}
							border={
								isUndefined(props.formConfig?.border)
									? true
									: props.formConfig?.border
							}
							items={tab.formItems}
							rules={rules.value}
							{...formOptions}
						/>
					</Tabs.TabPane>
				))}
			</Tabs>
		</div>
	);

	const formRefs = ref<Record<string, VxeFormInstance>>({});

	const formTabs = computed(() => {
		const tabs = props.formTabs || [];
		return tabs.map((tab) => {
			const items = mapTree(tab.formItems, (item) => {
				if (item._DATA_TYPE === 'children') {
					return {
						...omit(
							item,
							'property',
							'dataType',
							'editType',
							'dateFormatter',
							'codeSize',
							'isTextarea',
							'showCodeValue',
							'timeFormatter',
							'digits',
							'boolOptions',
							'enumOptions',
							'codeType',
							'tipContent',
							'enableFilter'
						),
						field: item.property?.fieldName,
						itemRender: useFormItemRender(item),
					};
				}
				return item;
			});

			return {
				...tab,
				formItems: items,
			};
		});
	});

	const rules = computed(() => {
		const { formTabs } = props;
		const editRules: Record<string, any> = {};
		formTabs?.forEach((tab) => {
			eachTree(tab.formItems, (item) => {
				if (item?._DATA_TYPE === 'children') {
					if (item.validConfig && item.property?.fieldName) {
						editRules[item.property?.fieldName] =
							item.validConfig.filter(Boolean);
					}
				}
			});
		});
		return editRules;
	});

	onMounted(() => {
		nextTick(() => {
			const tableElement = tableInstance.value?.$el;
			if (!tableInstance.value) {
				return;
			}
			tableWrapper.value = tableElement.querySelector(
				'.vxe-table--layout-wrapper'
			);
			if (tableWrapper.value && formWrapper.value) {
				tableWrapper.value.appendChild(formWrapper.value);
			}
		});
	});

	// 当前选中的行
	const currentRow = computed(() => tableInstance.value?.getCurrentRecord());

	// 数据来源 表单还是表格 表格的话不触发row修改
	const source = ref('table');

	watch(
		() => currentRow.value,
		(value) => {
			formOptions.data = cloneDeep(value);
			source.value = 'table';
		}
	);

	watch(
		() => showForm.value,
		(value) => {
			if (value && currentRow.value) {
				tableInstance.value?.clearCheckboxRow();
				tableInstance.value?.clearRadioRow();
				tableInstance.value?.setCheckboxRow(currentRow.value, true);
				tableInstance.value?.setRadioRow(currentRow.value);
			}
		}
	);

	watch(
		() => formOptions.data,
		(value) => {
			if (source.value === 'form') {
				tableInstance.value?.setRow(currentRow.value, value);
			}
			source.value = 'form';
		},
		{
			deep: true,
		}
	);

	const openForm = () => {
		showForm.value = !showForm.value;
	};

	watch(
		() => tableInstance.value?.getData(),
		() => {
			tableInstance.value?.clearCurrentRow();
		}
	);

	// 添加获取上一条和下一条记录的函数
	function getNextRow(currentRow: any) {
		if (tableInstance.value) {
			// 获取当前可见数据
			const visibleData = tableInstance.value.getTableData().visibleData;

			// 获取当前行的 rowId
			const rowId = tableInstance.value.getRowid(currentRow);

			// 在 visibleData 里查找 rowId 的位置
			const currentIndex = visibleData.findIndex(
				(row) => row._X_ROW_KEY === rowId
			);

			if (currentIndex === -1 || currentIndex >= visibleData.length - 1) {
				return null;
			}

			return visibleData[currentIndex + 1];
		}
		return null;
	}

	function getPreviousRow(currentRow: any) {
		if (tableInstance.value) {
			// 获取当前可见数据
			const visibleData = tableInstance.value.getTableData().visibleData;

			// 获取当前行的 rowId
			const rowId = tableInstance.value.getRowid(currentRow);

			// 在 visibleData 里查找 rowId 的位置
			const currentIndex = visibleData.findIndex(
				(row) => row._X_ROW_KEY === rowId
			);

			if (currentIndex <= 0) {
				return null;
			}

			return visibleData[currentIndex - 1];
		}
		return null;
	}

	// 修改工具栏渲染函数，添加实际的导航功能
	const renderFormTools = () => (
		<div style={{ display: 'flex', alignItems: 'center' }}>
			<Tooltip title="上一条">
				<Button
					icon={<LeftOutlined />}
					style={{
						opacity: 0.6,
						fontWeight: 600,
						padding: '4px 6px',
						fontSize: '14px',
					}}
					type="text"
					onClick={() => {
						const prevRow = getPreviousRow(currentRow.value);
						if (prevRow) {
							tableInstance.value?.clearCheckboxRow();
							tableInstance.value?.clearRadioRow();
							tableInstance.value?.setCurrentRow(prevRow);
							tableInstance.value?.setCheckboxRow(prevRow, true);
							tableInstance.value?.setRadioRow(prevRow);
						}
					}}
				></Button>
			</Tooltip>
			<Tooltip title="下一条">
				<Button
					icon={<RightOutlined />}
					style={{
						opacity: 0.6,
						fontWeight: 600,
						padding: '4px 6px',
						fontSize: '14px',
					}}
					type="text"
					onClick={() => {
						const nextRow = getNextRow(currentRow.value);
						if (nextRow) {
							tableInstance.value?.clearCheckboxRow();
							tableInstance.value?.clearRadioRow();
							tableInstance.value?.setCurrentRow(nextRow);
							tableInstance.value?.setCheckboxRow(nextRow, true);
							tableInstance.value?.setRadioRow(nextRow);
						}
					}}
				></Button>
			</Tooltip>
			<Tooltip title="还原">
				<Button
					icon={<RollbackOutlined />}
					type="text"
					style={{
						opacity: 0.6,
						fontWeight: 600,
						padding: '4px 6px',
					}}
					onClick={() => {
						tableInstance.value?.revertData(currentRow.value);
						formOptions.data = cloneDeep(
							tableInstance.value?.getCurrentRecord()
						);
					}}
				></Button>
			</Tooltip>
			<Tooltip title="关闭">
				<Button
					icon={<CloseOutlined />}
					type="text"
					style={{
						opacity: 0.6,
						fontWeight: 600,
						padding: '4px 6px',
					}}
					onClick={() => {
						showForm.value = false;
					}}
				></Button>
			</Tooltip>
		</div>
	);

	// 添加切换按钮的样式
	const designMode = inject<string>('__designMode', 'live');

	const switchButtonStyle = computed(() => ({
		position: 'absolute',
		top: '8px',
		left: '50%',
		transform: 'translateX(-50%)',
		zIndex: 100,
		padding: '4px 12px',
		borderRadius: '16px',
		backgroundColor: '#fff',
		boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
		display: designMode === 'design' ? 'block' : 'none',
	}));

	// 渲染切换按钮
	const renderSwitchButton = () => (
		<Button
			style={switchButtonStyle.value}
			type="default"
			icon={<SwapOutlined />}
			onClick={() => {
				openForm();
			}}
		>
			{showForm.value ? '切换到表格' : '切换到表单'}
		</Button>
	);
	return {
		designMode,
		renderForm,
		showForm,
		openForm,
		renderFormTools,
		renderSwitchButton,
		switchButtonStyle,
		formRefs,
	};
}

function useFormItemRender(item: FormItemProps) {
	const { editType, property, dataType } = item;

	const topFieldTypeFlag = property?.topFieldTypeFlag;

	if (topFieldTypeFlag === '1') {
		return {
			name: 'LtEntityRenderFormEdit',
			props: {
				__formatter: useCellFormat(item),
				...getProps(item),
				editDataConfig: item?.editDataConfig,
				editColumns: item?.editColumns,
			},
		};
	}
	if (editType === 'text') {
		return {
			name: 'LtTextRenderFormEdit',
			props: {
				__formatter: useCellFormat(item),
				...getProps(item),
			},
		};
	}
	if (editType === 'number') {
		return {
			name: 'LtNumberRenderFormEdit',
			props: {
				__formatter: useCellFormat(item),
				...getProps(item),
			},
		};
	}
	if (editType === 'boolean') {
		return {
			name: 'LtBooleanRenderFormEdit',
			props: {
				__formatter: useCellFormat(item),
				...getProps(item),
			},
		};
	}
	if (editType === 'select') {
		return {
			__formatter: useCellFormat(item),
			name: 'LtSelectRenderFormEdit',
			props: {
				__formatter: useCellFormat(item),
				...getProps(item),
			},
		};
	}
	if (editType === 'date') {
		return {
			name: 'LtDateRenderFormEdit',
			props: {
				__formatter: useCellFormat(item),
				...getProps(item),
			},
		};
	}
	if (editType === 'time') {
		return {
			name: 'LtTimeRenderFormEdit',
			props: {
				__formatter: useCellFormat(item),
				...getProps(item),
			},
		};
	}

	// 禁用编辑 放在在底部判断
	if (editType === 'disabledEdit') {
		return {
			name: dataType === 'code' ? 'LtTextRenderCode' : 'LtReadOnlyForm',
			props: {
				__formatter: useCellFormat(item),
				...getProps(item),
			},
		};
	}
}

function getProps(column: FormItemProps) {
	const {
		dataType = 'text',
		isTextarea,
		boolOptions,
		enumOptions,
		codeType,
		codeSize,
		showCodeValue,
		dateFormatter = 'YYYY-MM-DD HH:mm:ss',
		timeFormatter = 'HH:mm:ss',
	} = column;
	let props: any = {};
	if (dataType === 'text') {
		props = {
			isTextarea,
		};
	}
	if (dataType === 'code') {
		props = {
			codeType,
			codeSize,
			showCodeValue,
		};
	}
	if (dataType === 'boolean') {
		props = {
			options: boolOptions || [],
		};
	}
	if (dataType === 'enum') {
		props = {
			options: enumOptions || [],
		};
	}
	if (dataType === 'date') {
		props = {
			dateFormatter,
		};
	}
	if (dataType === 'time') {
		props = {
			timeFormatter,
		};
	}

	return {
		dataType,
		...props,
	};
}

function useCellFormat(column: FormItemProps) {
	const {
		dataType,
		dateFormatter,
		timeFormatter,
		digits,
		boolOptions,
		enumOptions,
	} = column;

	let formatter = null;
	if (dataType === 'date') {
		formatter = [];
		formatter.push('LtDateFormatter');
		formatter.push(dateFormatter);
	}
	if (dataType === 'time') {
		formatter = [];
		formatter.push('LtDateFormatter');
		formatter.push(timeFormatter);
	}
	if (dataType === 'number') {
		formatter = [];
		formatter.push('LtFixedUnitFormatter');
		formatter.push(digits);
	}
	if (dataType === 'boolean') {
		formatter = [];
		formatter.push('LtOptionFormatter');
		formatter.push(boolOptions);
	}
	if (dataType === 'enum') {
		formatter = [];
		formatter.push('LtOptionFormatter');
		formatter.push(enumOptions);
	}

	return formatter;
}
