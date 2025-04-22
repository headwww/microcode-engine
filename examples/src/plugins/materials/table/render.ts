import { ColumnProps } from './ColumnProps';

export function useCellRender(column: ColumnProps) {
	const { dataType } = column;

	const cellRender: any = {
		name: 'LtDefaultRenderTableCell',
	};

	if (dataType === 'link') {
		cellRender.name = 'LtLinkRenderTableCell';
	}
	if (dataType === 'code') {
		cellRender.name = 'LtCodeRenderTableCell';
		cellRender.props = getProps(column);
	}
	if (dataType === 'boolean') {
		cellRender.name = 'LtTagRenderTableCell';
		cellRender.props = getProps(column);
	}
	if (dataType === 'enum') {
		cellRender.name = 'LtTagRenderTableCell';
		cellRender.props = getProps(column);
	}

	return {
		cellRender,
	};
}

function getProps(column: ColumnProps) {
	const { dataType = 'text', boolOptions, enumOptions, codeType } = column;
	let props: any = {};
	if (dataType === 'code') {
		props = {
			codeType,
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

	return {
		dataType,
		...props,
	};
}

export function useCellFormat(column: ColumnProps) {
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

	return { formatter };
}

export function useCellEdit(column: ColumnProps) {
	const { editType } = column;

	const editRender: any = {
		name: 'LtDefaultRenderTableEdit',
		props: {
			...getProps(column),
		},
	};
	if (editType === 'text') {
		editRender.name = 'LtTextRenderTableEdit';
		editRender.props = getProps(column);
	}

	return { editRender };
}
