import { computed, defineComponent, PropType } from 'vue';
import { VxeGrid, VxeGridPropTypes, VxeTablePropTypes } from 'vxe-table';

export default defineComponent({
	name: 'LtTable',
	props: {
		columns: {
			type: Array as PropType<VxeGridPropTypes.Columns>,
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
		drag: {
			type: Boolean,
			default: true,
		},
	},
	setup(props) {
		const columns = computed(() =>
			props.columns?.filter(Boolean).map((item) => ({
				...item,
				showOverflow: true,
			}))
		);

		/**
		 * 基础样式
		 */
		const baseConfig = computed(() => {
			const {
				border,
				round,
				size,
				align,
				stripe,
				showOverflow,
				virtualScroll,
			} = props;
			return {
				// 显示溢出 建议开启优化渲染性能
				showOverflow,
				border,
				round,
				size,
				align,
				stripe,
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
			};
		});

		const columnConfig = computed(() => {
			const { drag } = props;
			return {
				resizable: true,
				drag,
			};
		});

		return () => (
			<div style={{ height: '100%', overflow: 'hidden' }}>
				<VxeGrid
					{...baseConfig.value}
					columnConfig={columnConfig.value}
					columns={columns.value}
					data={mock}
				></VxeGrid>
			</div>
		);
	},
});

const mock = Array.from({ length: 1000 }, (_, index) => ({
	id: `${index + 1}测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试`,
}));
