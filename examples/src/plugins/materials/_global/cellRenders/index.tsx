import { VxeUI } from 'vxe-pc-ui';
import { isObject } from 'lodash-es';
import LtDefaultRenderTableCell from './default';
import LtLinkRenderTableCell from './link';
import LtCodeRenderTableCell from './code';
import LtTagRenderTableCell from './tag';

export {
	LtDefaultRenderTableCell,
	LtLinkRenderTableCell,
	LtCodeRenderTableCell,
	LtTagRenderTableCell,
};

VxeUI.renderer.add('LtDefaultRenderTableCell', {
	renderTableCell: (renderOpts, params) => {
		const { row, column, $grid } = params;
		const cellValue = $grid?.getCellLabel(row, column);
		if (isObject(cellValue)) {
			return <span style={{ color: 'red' }}>数据类型不符合</span>;
		}
		if (cellValue) {
			return <LtDefaultRenderTableCell>{cellValue}</LtDefaultRenderTableCell>;
		}
		return null;
	},
	renderTableDefault: (renderOpts, params) => {
		const { row, column, $grid } = params;
		const cellValue = $grid?.getCellLabel(row, column);
		if (isObject(cellValue)) {
			return <span style={{ color: 'red' }}>数据类型不符合</span>;
		}
		if (cellValue) {
			return <LtDefaultRenderTableCell>{cellValue}</LtDefaultRenderTableCell>;
		}
		return null;
	},
});

VxeUI.renderer.add('LtLinkRenderTableCell', {
	renderTableCell: (renderOpts, params) => {
		const { row, column, $grid } = params;
		const cellValue = $grid?.getCellLabel(row, column);
		if (isObject(cellValue)) {
			return <span style={{ color: 'red' }}>数据类型不符合</span>;
		}
		if (cellValue) {
			return <LtLinkRenderTableCell>{cellValue}</LtLinkRenderTableCell>;
		}
		return null;
	},
	renderTableDefault: (renderOpts, params) => {
		const { row, column, $grid } = params;
		const cellValue = $grid?.getCellLabel(row, column);
		if (isObject(cellValue)) {
			return <span style={{ color: 'red' }}>数据类型不符合</span>;
		}
		if (cellValue) {
			return <LtLinkRenderTableCell>{cellValue}</LtLinkRenderTableCell>;
		}
		return null;
	},
});

VxeUI.renderer.add('LtTagRenderTableCell', {
	renderTableCell: (renderOpts, params) => {
		const { row, column, $grid } = params;
		const cellValue = $grid?.getCellLabel(row, column);
		if (isObject(cellValue)) {
			return <span style={{ color: 'red' }}>数据类型不符合</span>;
		}
		const options = renderOpts.props.options || [];
		const color = options.find((item: any) => item.text === cellValue)?.color;

		if (cellValue) {
			return (
				<LtTagRenderTableCell color={color || 'default'}>
					{cellValue}
				</LtTagRenderTableCell>
			);
		}
		return null;
	},
	renderTableDefault: (renderOpts, params) => {
		const { row, column, $grid } = params;
		const cellValue = $grid?.getCellLabel(row, column);
		if (isObject(cellValue)) {
			return <span style={{ color: 'red' }}>数据类型不符合</span>;
		}
		const options = renderOpts?.props?.options || [];
		const color = options.find((item: any) => item.text === cellValue)?.color;

		if (cellValue) {
			return (
				<LtTagRenderTableCell color={color}>{cellValue}</LtTagRenderTableCell>
			);
		}
		return null;
	},
});

VxeUI.renderer.add('LtCodeRenderTableCell', {
	renderTableCell: (renderOpts, params) => {
		const { row, column, $grid } = params;
		const cellValue = $grid?.getCellLabel(row, column);
		if (isObject(cellValue)) {
			return <span style={{ color: 'red' }}>数据类型不符合</span>;
		}
		const codeType = renderOpts.props.codeType;
		if (cellValue) {
			return (
				<LtCodeRenderTableCell code={cellValue.toString()} type={codeType} />
			);
		}
		return null;
	},
	renderTableDefault: (renderOpts, params) => {
		const { row, column, $grid } = params;
		const cellValue = $grid?.getCellLabel(row, column);
		if (isObject(cellValue)) {
			return <span style={{ color: 'red' }}>数据类型不符合</span>;
		}
		const codeType = renderOpts?.props?.codeType;
		if (cellValue) {
			return (
				<LtCodeRenderTableCell code={cellValue.toString()} type={codeType} />
			);
		}
		return null;
	},
});
