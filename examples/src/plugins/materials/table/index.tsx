import { computed, defineComponent, reactive, ref, watch } from 'vue';
import { VxeGrid, VxeGridInstance, VxeUI } from 'vxe-table';
import { get, isArray, omit } from 'lodash-es';
import {
	Button,
	Divider,
	Tooltip,
	Menu,
	Dropdown,
	message,
} from 'ant-design-vue';
import {
	DownloadOutlined,
	FullscreenExitOutlined,
	FullscreenOutlined,
	PaperClipOutlined,
	PrinterOutlined,
	ReloadOutlined,
	SearchOutlined,
	TableOutlined,
	UploadOutlined,
} from '@ant-design/icons-vue';
import { eachTree, mapTree, uniq } from 'xe-utils';
import { useCellEdit, useCellFormat, useCellRender, useFilter } from './render';
import { useArea } from './area';
import './style.scss';
import { formatTableCell } from '../_global/utils';
import { useTableForm } from './form';
import { ColumnProps, tableProps } from './types';

// 字符，数字，布尔，日期（日期格式，时间选择器），枚举，实体（数据源，），
// 图片先支持二维码打印
export default defineComponent({
	name: 'LtTable',
	props: {
		...tableProps,
	},
	emits: ['update:data'],
	setup(props, { expose }) {
		const tableRef = ref<VxeGridInstance & HTMLDivElement>();

		// 列配置
		const columns = computed(() => {
			const { actionConfig, columns, rowSelectorConfig, seqConfig } = props;
			const cols = [];
			if (seqConfig && seqConfig.visible) {
				const { title, width } = seqConfig;
				cols.push({
					type: 'seq',
					field: '$seq',
					title,
					width,
					fixed: 'left',
					align: 'center',
				});
			}

			if (rowSelectorConfig && rowSelectorConfig.visible) {
				const { type, title, width } = rowSelectorConfig;
				cols.push({
					type,
					title,
					width,
					align: 'center',
					fixed: 'left',
				});
			}

			// 字段列
			const fields = mapTree(columns, (item: ColumnProps) => {
				if (item?._DATA_TYPE === 'children') {
					const { cellRender } = useCellRender(item);
					const { formatter } = useCellFormat(item);
					const editRender = useCellEdit(item);

					const { filterRender, filters } = useFilter(item);

					const { tipContent } = item;

					const column = {
						field: item.property?.fieldName,
						...omit(item, [
							'property',
							'dataType',
							'editType',
							'dateFormatter',
							'timeFormatter',
							'digits',
							'boolOptions',
							'enumOptions',
							'codeType',
							'tipContent',
							'enableFilter',
						]),
						treeNode:
							item.property?.fieldName &&
							item.property?.fieldName === props.treeConfig?.treeNode,
						cellRender,
						editRender,
						filters: item.enableFilter ? filters : null,
						filterRender: item.enableFilter ? filterRender : null,
						titleSuffix: tipContent
							? {
									content: tipContent,
								}
							: null,
						params: {
							// TODO 格式化暂时先当作额外参数来设置，直接在formatter中设置会有问题
							formatter,
						},
					};
					return column as any;
				}
				return {
					title: item.title,
					fixed: item.fixed,
				};
			});

			cols.push(...fields);

			if (actionConfig && actionConfig.enable) {
				const { title, width, buttonType, maxShowCount, actions } =
					actionConfig;
				const actionColumn = {
					title,
					width,
					showOverflow: 'ellipsis',
					fixed: actionConfig.fixed,
					cellRender: {
						name: 'LtActionsRenderTableCell',
						props: {
							actions,
							buttonType,
							maxShowCount,
						},
					},
				};
				cols?.push(actionColumn);
			}

			return cols;
		});

		// 编辑校验
		const editRules = computed(() => {
			const { columns } = props;
			const editRules: Record<string, any> = {};
			eachTree(columns, (item) => {
				if (item?._DATA_TYPE === 'children') {
					if (item.validConfig && item.property?.fieldName) {
						editRules[item.property?.fieldName] =
							item.validConfig.filter(Boolean);
					}
				}
			});
			return editRules;
		});

		// 基础配置
		const baseConfig = computed(() => {
			const {
				border,
				round,
				size,
				align,
				stripe,
				showOverflow,
				virtualScroll,
				loading,
				rowStyle,
				cellStyle,
			} = props;
			return {
				// 显示溢出 建议开启优化渲染性能
				showOverflow,
				border,
				round,
				size,
				align,
				stripe,
				loading,
				maxHeight: '100%',
				// 虚拟滚动 只通过一个virtualScroll参数来控制 默认开启
				virtualYConfig: {
					enabled: virtualScroll,
					gt: 0,
				},
				virtualXConfig: {
					enabled: virtualScroll,
					gt: 0,
				},
				height: 'auto',
				tooltipConfig: {
					enterable: true,
				},
				rowStyle,
				cellStyle,
			};
		});

		// 序号配置
		const seqConfig = computed((): any => {
			const { seqConfig } = props;
			if (seqConfig && seqConfig.visible) {
				const { startIndex, seqMethod } = seqConfig;
				return {
					startIndex,
					seqMethod,
				};
			}
			return null;
		});

		// 行选择器配置
		const rowSelectorConfig = computed((): any => {
			const { rowSelectorConfig } = props;
			if (rowSelectorConfig && rowSelectorConfig.visible) {
				const {
					labelField,
					checkMethod,
					showHeader,
					type,
					trigger,
					highlight,
					strict,
					visibleMethod,
					range,
					checkAll,
					checkStrictly,
				} = rowSelectorConfig;
				if (type === 'checkbox') {
					return {
						labelField,
						checkMethod,
						trigger,
						highlight,
						strict,
						visibleMethod,
						showHeader,
						range,
						checkAll,
						checkStrictly,
					};
				}
				return {
					labelField,
					checkMethod,
					trigger,
					highlight,
					strict,
					visibleMethod,
				};
			}
			return null;
		});

		// 全表触发，选中行触发，不触发
		// 全表触发就不需要考虑选中行触发和表单触发，
		// 选中行触发判断当前是表单模式还是表格模式，表格模式用表格模式的校验。表单模式用表单模式的校验
		const validate = (type: 'full' | 'checked', fn?: () => void) => {
			if (type === 'full') {
				tableRef.value?.fullValidate().then((params) => {
					if (!params) {
						// 全表触发，没有错误，则执行回调
						fn?.();
					} else {
						message.error('全表校验失败！');
					}
				});
			} else {
				if (showForm.value) {
					// 表单模式
					const arr: Promise<any>[] = [];

					Object.keys(formRefs.value).forEach((key) => {
						arr.push(formRefs.value[key].validate());
					});

					Promise.all(arr).then((params) => {
						const error = params.filter(Boolean);
						if (!error.length) {
							fn?.();
						} else {
							message.error('表单校验失败！');
						}
					});
				} else {
					const checkboxRecords = tableRef.value?.getCheckboxRecords() || [];
					const radioRecord = tableRef.value?.getRadioRecord()
						? [tableRef.value?.getRadioRecord()]
						: [];
					const records = [...checkboxRecords, ...radioRecord];
					tableRef.value?.validate(records).then((params) => {
						if (!params) {
							fn?.();
						} else {
							message.error('选中行校验失败！');
						}
					});
				}
			}
		};

		// 按钮渲染
		const renderButtons = () => (
			<div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
				{props.buttons?.map((item) => {
					const { id, mode, type, menus, loading } = item;
					if (mode === 'button') {
						return (
							<Button
								key={id}
								type={type}
								loading={loading}
								disabled={item.disabled?.(params.value)}
								onClick={() => {
									if (!item.validate || item.validate === 'none') {
										item.onClick?.(params.value);
									} else {
										validate(item.validate, () => {
											item.onClick?.(params.value);
										});
									}
								}}
							>
								{item.label}
							</Button>
						);
					}

					const menuItems = menus?.map((item: any) => ({
						key: item.id,
						label: item.label,
						title: item.label,
						onClick: () => {
							if (!item?.validate || item?.validate === 'none') {
								item.onClick?.(params.value);
							} else {
								validate(item?.validate, () => {
									item.onClick?.(params.value);
								});
							}
						},
						disabled: item.disabled?.(params.value),
					}));

					return (
						<Dropdown
							overlay={<Menu items={menuItems}></Menu>}
							key={id}
							trigger="click"
							type={type}
						>
							<Button loading={loading} key={id} type={type}>
								{item.label}
							</Button>
						</Dropdown>
					);
				})}
			</div>
		);

		// 工具栏渲染
		const renderTools = () => (
			<div>
				<Button
					type="text"
					style={{ opacity: 0.6, fontWeight: 600, padding: '4px 6px' }}
					icon={<UploadOutlined />}
				>
					导入
				</Button>
				<Button
					type="text"
					style={{ opacity: 0.6, fontWeight: 600, padding: '4px 6px' }}
					icon={<DownloadOutlined />}
				>
					导出
				</Button>
				<Button
					type="text"
					style={{ opacity: 0.6, fontWeight: 600, padding: '4px 6px' }}
					icon={<PrinterOutlined />}
				>
					打印
				</Button>
				<Button
					type="text"
					style={{ opacity: 0.6, fontWeight: 600, padding: '4px 6px' }}
					icon={<PaperClipOutlined />}
				>
					附件
				</Button>
				<Divider type="vertical" />
				<Tooltip title="搜索">
					<Button
						icon={<SearchOutlined />}
						style={{ opacity: 0.6, fontWeight: 600, padding: '4px 6px' }}
						type="text"
					></Button>
				</Tooltip>
				<Tooltip title="点击刷新，单击右键重置筛选并刷新">
					<Button
						icon={<ReloadOutlined />}
						style={{ opacity: 0.6, fontWeight: 600, padding: '4px 6px' }}
						type="text"
						onClick={() => {
							props.onRefresh?.(params.value);
						}}
						onContextmenu={(e: any) => {
							e.preventDefault();
							// 右键点击事件，可以调用另一个方法
							props.onRefresh?.(params.value);
							tableRef.value?.clearFilter();
						}}
					></Button>
				</Tooltip>
				<Tooltip title="切换表单">
					<Button
						icon={<TableOutlined />}
						style={{ opacity: 0.6, fontWeight: 600, padding: '4px 6px' }}
						type="text"
						onClick={() => {
							tableRef.value?.openCustom();
						}}
					></Button>
				</Tooltip>
				<Tooltip title={tableRef.value?.isMaximized() ? '还原' : '全屏'}>
					<Button
						type="text"
						icon={
							tableRef.value?.isMaximized() ? (
								<FullscreenExitOutlined />
							) : (
								<FullscreenOutlined />
							)
						}
						style={{ opacity: 0.6, fontWeight: 600, padding: '4px 6px' }}
						onClick={() => {
							tableRef.value?.zoom();
						}}
					></Button>
				</Tooltip>
			</div>
		);

		// 右键菜单配置
		const menuConfig = computed(() => ({
			header: {
				options: [
					[
						{ code: 'HIDDEN_COLUMN', name: '隐藏列' },
						{ code: 'RESET_COLUMN', name: '取消隐藏' },
						{ code: 'CLEAR_SORT', name: '清除排序(当前列)' },
						{ code: 'CLEAR_ALL_SORT', name: '清除排序(全部)' },
						{ code: 'RESET_FILTER', name: '重置筛选' },
					],
				],
			},
			body: {
				options: [
					[{ code: 'REFRESH', name: '刷新' }],
					[{ code: 'OPEN_FORM', name: '切换到表单' }],
					[
						{
							name: '复制',
							children: [
								{
									code: 'COPY_AREA',
									name: '复制(ctrl+c)',
									disabled: !hasSelection.value,
								},
								{ code: 'COPY_TEXT', name: '文本复制(单元格)' },
								{ code: 'COPY_ROW', name: '复制(行)' },
							],
						},
						{
							name: '粘贴',
							children: [
								{
									code: 'PASTE_AREA',
									name: '粘贴(ctrl+v)',
									disabled: !copyAreaData.value,
								},
								{
									code: 'PASTE_ROW',
									name: '粘贴(行)',
									disabled: !copyRowData.value,
								},
								{
									code: 'PASTE_ROW_SELECT',
									name: '粘贴到选中行',
									disabled: !copyRowData.value,
								},
							],
						},
					],
					[
						{
							code: 'REVERT_ALL',
							name: '还原',
						},
						{
							code: 'CLOSE_SELECTION',
							name: '取消选区',
						},
					],
				],
			},
		}));

		const {
			renderArea,
			destroyAreaBox,
			hasSelection,
			copyAreaData,
			pasteArea,
			copyArea,
		} = useArea(tableRef);

		// 复制行数据
		const copyRowData = ref();

		const onMenuClick = (parameter: any) => {
			const { menu, $table, row, column } = parameter;
			switch (menu.code) {
				case 'REFRESH':
					props.onRefresh?.(params.value);
					break;
				case 'OPEN_FORM':
					if (row) {
						tableRef.value?.setCurrentRow(row);
						openForm();
					}
					break;
				case 'CLEAR_CELL':
					$table.closeSelection();
					break;
				case 'CLOSE_SELECTION':
					destroyAreaBox();
					break;
				case 'COPY_TEXT':
					if (row && column) {
						const cellValue = get(row, column.field);
						const formatCellValue = formatTableCell({ cellValue, row, column });
						VxeUI.clipboard.copy(formatCellValue)
							? message.success('复制到剪贴板')
							: message.error('复制失败');
					}
					break;
				case 'COPY_ROW':
					if (row && column) {
						copyRowData.value = omit(row, ['id', '_X_ROW_KEY']);
						message.success('复制行');
					}
					break;
				case 'PASTE_ROW':
					if (row && column) {
						$table?.setRow(row, {
							id: row?.id,
							...copyRowData.value,
						});
					}
					break;
				case 'PASTE_ROW_SELECT':
					if (row && column) {
						const records = [
							...($table?.getCheckboxRecords() || []),
							...($table?.getRadioRecord() || []),
						];
						records.forEach((r) => {
							$table?.setRow(r, {
								id: r?.id,
								...copyRowData.value,
							});
						});
					}
					break;
				case 'COPY_AREA':
					copyArea();
					break;
				case 'PASTE_AREA':
					pasteArea();
					break;
			}
		};

		// 返回给父组件的参数
		const params = computed(() => {
			const { targetClass, columns, formTabs } = props;

			let queryPath: string[] = [];
			eachTree(columns, (item) => {
				if (item?._DATA_TYPE === 'children') {
					queryPath.push(item.property?.fieldName);
				}
			});

			formTabs?.forEach((tab) => {
				eachTree(tab.formItems, (item) => {
					if (item?._DATA_TYPE === 'children') {
						queryPath.push(item.property?.fieldName);
					}
				});
			});

			// 去重
			queryPath = uniq(queryPath.filter(Boolean));

			if (pagerConfig?.enabled) {
				return {
					$table: tableRef.value,
					pagerConfig: {
						pageSize: pagerConfig?.pageSize,
						pageNo: (pagerConfig?.currentPage ?? 1) - 1,
						rowCountEnabled: true,
					},
					condition: {
						targetClass,
						queryPath,
					},
				};
			}
			return {
				$table: tableRef.value,
				condition: {
					targetClass,
					queryPath,
				},
			};
		});

		// 数据
		const data = computed({
			get: () => {
				if (props.data) {
					if (isArray(props.data)) {
						return props.data;
					}
					if (props.pagerConfig?.enabled) {
						return props.data?.result;
					}
					return undefined;
				}
				return undefined;
			},
			set: (newVal: any) => {
				newVal;
			},
		});

		// 分页配置
		const pagerConfig = reactive({
			total: 0,
			currentPage: props.pagerConfig?.currentPage,
			pageSize: props.pagerConfig?.pageSize,
			pageSizes: props.pagerConfig?.pageSizes,
			enabled: !!props.pagerConfig?.enabled,
		});

		watch(
			() => props.pagerConfig,
			(newVal) => {
				pagerConfig.enabled = !!newVal?.enabled;
				pagerConfig.pageSizes = newVal?.pageSizes;
			}
		);

		watch(
			() => props.data,
			(newVal) => {
				if (newVal) {
					if (isArray(newVal)) {
						return;
					}
					if (pagerConfig?.enabled) {
						pagerConfig.total = newVal?.rowCount || 0;
					}
				}
			}
		);

		const onPageChange = (pager: any) => {
			pagerConfig.pageSize = pager.pageSize;
			pagerConfig.currentPage = pager.currentPage;
			props.pagerConfig?.onPageChange?.(params.value);
		};

		const footerData = ref<any>([]);

		// 表尾数据
		watch(
			() => [data.value, props.footerConfig] as const,
			([newVal, footerConfig]) => {
				if (footerConfig && footerConfig?.showFooter) {
					footerData.value = footerConfig?.footerItems
						?.filter(Boolean)
						.map((item) => {
							const { label, fields, footerDataMethod } = item;
							const footerFields = fields?.reduce((acc: any, field: string) => {
								acc[field] = footerDataMethod?.(newVal, field);
								return acc;
							}, {});
							return {
								$seq: label,
								...footerFields,
							};
						});
				}
			},
			{
				deep: true,
			}
		);

		const {
			renderForm,
			renderSwitchButton,
			renderFormTools,
			showForm,
			openForm,
			formRefs,
		} = useTableForm(tableRef, props);

		expose({
			$table: () => tableRef.value,
			$forms: () => formRefs.value,
			getParams: () => params.value,
		});

		// 验证
		return () => (
			<div style={{ height: '100%', overflow: 'hidden', position: 'relative' }}>
				{props.__designMode === 'design' && renderSwitchButton()}
				{renderForm()}
				{/*  渲染区域 复制粘贴选区等操作 */}
				{renderArea()}
				<VxeGrid
					id={props.tableId}
					ref={tableRef}
					{...baseConfig.value}
					keepSource={true}
					columnConfig={props.columnConfig}
					editConfig={props.editConfig}
					rowConfig={props.rowConfig}
					pagerConfig={
						showForm.value
							? {
									enabled: false,
								}
							: pagerConfig
					}
					treeConfig={props.treeConfig}
					columns={columns.value}
					data={data.value}
					seqConfig={seqConfig.value}
					checkboxConfig={rowSelectorConfig.value}
					radioConfig={rowSelectorConfig.value}
					editRules={editRules.value}
					menuConfig={menuConfig.value}
					validConfig={{
						msgMode: 'full',
					}}
					currentRowConfig={{
						beforeSelectMethod: props.rowConfig?.beforeSelectMethod,
					}}
					toolbarConfig={{
						slots: {
							buttons: 'buttons',
							tools: 'tools',
						},
					}}
					showFooter={props.footerConfig?.showFooter}
					footerData={footerData.value}
					onPageChange={onPageChange}
					onMenuClick={onMenuClick}
				>
					{{
						buttons: () => renderButtons(),
						tools: () => (showForm.value ? renderFormTools() : renderTools()),
					}}
				</VxeGrid>
			</div>
		);
	},
});
