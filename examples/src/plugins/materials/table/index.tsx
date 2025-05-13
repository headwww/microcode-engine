import { computed, defineComponent, PropType, reactive, ref, watch } from 'vue';
import {
	VxeColumnPropTypes,
	VxeGrid,
	VxeGridInstance,
	VxeGridPropTypes,
	VxeTablePropTypes,
} from 'vxe-table';
import { isArray, omit } from 'lodash-es';
import { Button, Divider, Tooltip, Menu, Dropdown } from 'ant-design-vue';
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
import {
	ColumnProps,
	ActionConfig,
	RowSelectorProps,
	SeqConfig,
	ButtonOption,
	FooterConfig,
} from './types';
import { useCellEdit, useCellFormat, useCellRender } from './render';

// 字符，数字，布尔，日期（日期格式，时间选择器），枚举，实体（数据源，），
// 图片先支持二维码打印
export default defineComponent({
	name: 'LtTable',
	emits: ['update:data'],
	props: {
		targetClass: {
			type: String as PropType<string>,
		},
		columns: {
			type: Array as PropType<ColumnProps[]>,
		},
		border: {
			type: String as PropType<VxeTablePropTypes.Border>,
			default: 'default',
		},
		size: {
			type: String as PropType<VxeTablePropTypes.Size>,
			default: 'mini',
		},
		round: {
			type: Boolean,
			default: true,
		},
		stripe: {
			type: Boolean,
			default: true,
		},
		align: {
			type: String as PropType<VxeTablePropTypes.Align>,
			default: 'center',
		},
		showOverflow: {
			type: Boolean,
			default: true,
		},
		virtualScroll: {
			type: Boolean,
			default: true,
		},
		loading: {
			type: Boolean,
			default: false,
		},
		rowStyle: {
			type: [Function, Object] as PropType<VxeTablePropTypes.RowStyle>,
		},
		cellStyle: {
			type: [Function, Object] as PropType<VxeTablePropTypes.CellStyle>,
		},
		editConfig: {
			type: Object as PropType<VxeTablePropTypes.EditConfig>,
		},
		columnConfig: {
			type: Object as PropType<VxeTablePropTypes.ColumnConfig>,
		},
		rowConfig: {
			type: Object as PropType<
				VxeTablePropTypes.RowConfig & {
					beforeSelectMethod?: (params: any) => boolean;
				}
			>,
		},
		actionConfig: {
			type: Object as PropType<ActionConfig>,
		},
		rowSelectorConfig: {
			type: Object as PropType<RowSelectorProps>,
		},
		seqConfig: {
			type: Object as PropType<SeqConfig>,
		},
		buttons: {
			type: Array as PropType<ButtonOption[]>,
		},
		onRefresh: {
			type: Function as PropType<(params?: any) => void>,
		},
		pagerConfig: {
			type: Object as PropType<
				VxeGridPropTypes.PagerConfig & {
					onPageChange: (params: any) => void;
				}
			>,
		},
		footerConfig: {
			type: Object as PropType<FooterConfig>,
		},
		data: [Array, Object] as PropType<
			| any[]
			| {
					[key: string]: any;
					result: any[];
					pageNo: number;
					pageSize: number;
					rowCount: number;
			  }
		>,
	},
	setup(props, { expose }) {
		const tableRef = ref<VxeGridInstance>();

		const filters = ref<VxeColumnPropTypes.Filters>([]);
		// 列配置
		const columns = computed(() => {
			const { actionConfig, columns, rowSelectorConfig, seqConfig } = props;

			console.log('====');

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
			const fields =
				columns?.filter(Boolean).map((item) => {
					const { cellRender } = useCellRender(item);
					const { formatter } = useCellFormat(item);
					const editRender = useCellEdit(item);
					// const { filterRender } = useFilter(item, filters);

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
						]),

						cellRender,
						editRender,
						filters: filters.value,
						// filterRender,
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
				}) || [];

			cols.push(...fields);

			if (actionConfig && !actionConfig.hidden) {
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

		// 编辑规则
		const editRules = computed(() => {
			const { columns } = props;
			const editRules: Record<string, any> = {};
			columns?.forEach((item) => {
				if (item.validConfig && item.property?.fieldName) {
					editRules[item.property?.fieldName] =
						item.validConfig.filter(Boolean);
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
								onClick={() => item.onClick?.(params.value)}
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
							item.onClick?.(params.value);
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
				<Tooltip title="刷新">
					<Button
						icon={<ReloadOutlined />}
						style={{ opacity: 0.6, fontWeight: 600, padding: '4px 6px' }}
						type="text"
						onClick={() => {
							props.onRefresh?.(params.value);
						}}
					></Button>
				</Tooltip>
				<Tooltip title="显示列">
					<Button
						icon={<TableOutlined />}
						style={{ opacity: 0.6, fontWeight: 600, padding: '4px 6px' }}
						type="text"
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

		// 返回给父组件的参数
		const params = computed(() => {
			const { targetClass, columns } = props;

			const queryPath = columns
				?.filter(Boolean)
				.map((item) => item.property?.fieldName);

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
				pagerConfig.pageSize = newVal?.pageSize;
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
						pagerConfig.pageSize = newVal?.pageSize || 50;
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

		expose({
			getTable: () => tableRef.value,
			getParams: () => params.value,
		});

		return () => (
			<div style={{ height: '100%', overflow: 'hidden' }}>
				<VxeGrid
					ref={tableRef}
					{...baseConfig.value}
					keepSource={true}
					columnConfig={props.columnConfig}
					editConfig={props.editConfig}
					rowConfig={props.rowConfig}
					pagerConfig={pagerConfig}
					columns={columns.value}
					data={data.value}
					seqConfig={seqConfig.value}
					checkboxConfig={rowSelectorConfig.value}
					radioConfig={rowSelectorConfig.value}
					editRules={editRules.value}
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
				>
					{{
						buttons: () => renderButtons(),
						tools: () => renderTools(),
					}}
				</VxeGrid>
			</div>
		);
	},
});
