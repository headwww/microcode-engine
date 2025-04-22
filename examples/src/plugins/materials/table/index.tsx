import { computed, defineComponent, PropType } from 'vue';
import { VxeGrid, VxeTablePropTypes } from 'vxe-table';
import { ColumnProps } from './ColumnProps';
import { useCellEdit, useCellFormat, useCellRender } from './render';
// 字符，数字，布尔，日期（日期格式，时间选择器），枚举，实体（数据源，），
// 图片先支持二维码打印
export default defineComponent({
	name: 'LtTable',
	props: {
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
			type: Object as PropType<VxeTablePropTypes.RowConfig>,
		},
		data: Array,
	},
	setup(props) {
		const columns = computed(() =>
			props.columns?.filter(Boolean).map((item) => {
				const { cellRender } = useCellRender(item);
				const { formatter } = useCellFormat(item);
				const { editRender } = useCellEdit(item);
				const { tipContent } = item;

				return {
					...item,
					showOverflow: true,
					cellRender,
					editRender,
					formatter: formatter || null,
					titleSuffix: tipContent
						? {
								content: tipContent,
							}
						: null,
				} as any;
			})
		);

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

		return () => (
			<div style={{ height: '100%', overflow: 'hidden' }}>
				<VxeGrid
					{...baseConfig.value}
					keepSource={true}
					columnConfig={props.columnConfig}
					editConfig={props.editConfig}
					rowConfig={props.rowConfig}
					columns={columns.value}
					data={props.data}
				></VxeGrid>
			</div>
		);
	},
});
