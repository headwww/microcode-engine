import { VxeGlobalRendererHandles, VxeUI } from 'vxe-pc-ui';
import { get, isObject } from 'lodash-es';
import LtDefaultRenderTableCell from './default';
import LtLinkRenderTableCell from './link';
import LtCodeRenderTableCell from './code';
import LtTagRenderTableCell from './tag';
import { formatTableCell } from '../utils';

export {
	LtDefaultRenderTableCell,
	LtLinkRenderTableCell,
	LtCodeRenderTableCell,
	LtTagRenderTableCell,
};

VxeUI.renderer.mixin({
	LtDefaultRenderTableCell: {
		renderTableCell: (
			renderOpts: VxeGlobalRendererHandles.RenderTableCellOptions,
			params: VxeGlobalRendererHandles.RenderTableCellParams
		) => {
			const { row, column } = params;
			let cellValue = get(row, column.field);
			// 使用通用格式化函数
			cellValue = formatTableCell({ cellValue, row, column });
			if (isObject(cellValue)) {
				return <span style={{ color: 'red' }}>数据类型不符合</span>;
			}
			return <LtDefaultRenderTableCell>{cellValue}</LtDefaultRenderTableCell>;
		},

		renderTableDefault: (
			renderOpts: VxeGlobalRendererHandles.RenderTableDefaultOptions,
			params: VxeGlobalRendererHandles.RenderTableDefaultParams
		) => {
			const { row, column } = params;
			let cellValue = get(row, column.field);
			// 使用通用格式化函数
			cellValue = formatTableCell({ cellValue, row, column });
			if (isObject(cellValue)) {
				return <span style={{ color: 'red' }}>数据类型不符合</span>;
			}
			return <LtDefaultRenderTableCell>{cellValue}</LtDefaultRenderTableCell>;
		},
	},
	LtLinkRenderTableCell: {
		renderTableCell: (
			renderOpts: VxeGlobalRendererHandles.RenderTableCellOptions,
			params: VxeGlobalRendererHandles.RenderTableCellParams
		) => {
			const { row, column } = params;
			let cellValue = get(row, column.field);
			// 使用通用格式化函数
			cellValue = formatTableCell({ cellValue, row, column });
			if (isObject(cellValue)) {
				return <span style={{ color: 'red' }}>数据类型不符合</span>;
			}
			return <LtLinkRenderTableCell>{cellValue}</LtLinkRenderTableCell>;
		},

		renderTableDefault: (
			renderOpts: VxeGlobalRendererHandles.RenderTableCellOptions,
			params: VxeGlobalRendererHandles.RenderTableCellParams
		) => {
			const { row, column, $grid } = params;
			let cellValue = $grid?.getCellLabel(row, column);
			// 使用通用格式化函数
			cellValue = formatTableCell({ cellValue, row, column });
			if (isObject(cellValue)) {
				return <span style={{ color: 'red' }}>数据类型不符合</span>;
			}
			return <LtLinkRenderTableCell>{cellValue}</LtLinkRenderTableCell>;
		},
	},
	LtTagRenderTableCell: {
		renderTableCell: (
			renderOpts: VxeGlobalRendererHandles.RenderTableCellOptions,
			params: VxeGlobalRendererHandles.RenderTableCellParams
		) => {
			const { row, column } = params;
			let cellValue = get(row, column.field);
			// 使用通用格式化函数
			cellValue = formatTableCell({ cellValue, row, column });
			if (isObject(cellValue)) {
				return <span style={{ color: 'red' }}>数据类型不符合</span>;
			}
			const options = renderOpts.props.options || [];
			const color = options.find(
				(item: any) => item.label === cellValue
			)?.color;

			return (
				<LtTagRenderTableCell
					color={color || 'default'}
					value={cellValue}
				></LtTagRenderTableCell>
			);
		},
		renderTableDefault: (
			renderOpts: VxeGlobalRendererHandles.RenderTableCellOptions,
			params: VxeGlobalRendererHandles.RenderTableCellParams
		) => {
			const { row, column, $grid } = params;
			let cellValue = $grid?.getCellLabel(row, column);
			// 使用通用格式化函数
			cellValue = formatTableCell({ cellValue, row, column });
			if (isObject(cellValue)) {
				return <span style={{ color: 'red' }}>数据类型不符合</span>;
			}
			const options = renderOpts?.props?.options || [];
			const color = options.find(
				(item: any) => item.label === cellValue
			)?.color;

			return (
				<LtTagRenderTableCell color={color || 'default'} value={cellValue} />
			);
		},
	},

	LtCodeRenderTableCell: {
		renderTableCell: (
			renderOpts: VxeGlobalRendererHandles.RenderTableCellOptions,
			params: VxeGlobalRendererHandles.RenderTableCellParams
		) => {
			const { row, column } = params;
			let cellValue = get(row, column.field);
			// 使用通用格式化函数
			cellValue = formatTableCell({ cellValue, row, column });
			if (isObject(cellValue)) {
				return <span style={{ color: 'red' }}>数据类型不符合</span>;
			}
			const codeType = renderOpts.props.codeType;
			return (
				<LtCodeRenderTableCell code={cellValue?.toString()} type={codeType} />
			);
		},

		renderTableDefault: (
			renderOpts: VxeGlobalRendererHandles.RenderTableCellOptions,
			params: VxeGlobalRendererHandles.RenderTableCellParams
		) => {
			const { row, column } = params;
			let cellValue = get(row, column.field);
			// 使用通用格式化函数
			cellValue = formatTableCell({ cellValue, row, column });
			if (isObject(cellValue)) {
				return <span style={{ color: 'red' }}>数据类型不符合</span>;
			}
			const codeType = renderOpts?.props?.codeType;
			return (
				<LtCodeRenderTableCell code={cellValue?.toString()} type={codeType} />
			);
		},
	},
});
