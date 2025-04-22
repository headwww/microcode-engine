import { VxeUI } from 'vxe-pc-ui';
import { Input } from 'ant-design-vue';
import { isObject } from 'lodash-es';

import {
	LtDefaultRenderTableCell,
	LtLinkRenderTableCell,
	LtCodeRenderTableCell,
	LtTagRenderTableCell,
} from '../cellRenders';

VxeUI.renderer.add('LtDefaultRenderTableEdit', {
	renderTableEdit: renderTableCell,
	renderTableCell,
	renderTableDefault: renderTableCell,
});

VxeUI.renderer.add('LtTextRenderTableEdit', {
	autofocus: 'input.ant-input',
	renderTableEdit(renderOpts, params) {
		renderOpts;
		params;
		return <Input />;
	},
	renderTableCell,
	renderTableDefault: renderTableCell,
});

function renderTableCell(renderOpts: any, params: any) {
	const props = renderOpts.props;
	const dataType = props.dataType || 'text';
	const { row, column, $grid } = params;
	const cellValue = $grid?.getCellLabel(row, column);
	if (isObject(cellValue)) {
		return <span style={{ color: 'red' }}>数据类型不符合</span>;
	}
	if (!cellValue) {
		return <span></span>;
	}

	if (dataType === 'link') {
		return <LtLinkRenderTableCell>{cellValue}</LtLinkRenderTableCell>;
	}
	if (dataType === 'code') {
		const codeType = renderOpts?.props?.codeType;
		return (
			<LtCodeRenderTableCell code={cellValue.toString()} type={codeType} />
		);
	}
	if (dataType === 'boolean') {
		const options = renderOpts?.props?.options || [];
		const color = options.find((item: any) => item.text === cellValue)?.color;
		return (
			<LtTagRenderTableCell color={color}>{cellValue}</LtTagRenderTableCell>
		);
	}
	if (dataType === 'enum') {
		const options = renderOpts?.props?.options || [];
		const color =
			options.find((item: any) => item.text === cellValue)?.color || 'default';

		return (
			<LtTagRenderTableCell color={color}>{cellValue}</LtTagRenderTableCell>
		);
	}

	return <LtDefaultRenderTableCell>{cellValue}</LtDefaultRenderTableCell>;
}
