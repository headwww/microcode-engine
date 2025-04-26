import { ColumnProps } from './types';

export function useCellRender(column: ColumnProps) {
	const { dataType } = column;

	const cellRender: any = {
		name: 'LtDefaultRenderTableCell',
	};

	if (dataType === 'link') {
		cellRender.name = 'LtLinkRenderTableCell';
		cellRender.props = getProps(column);
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
	const {
		dataType = 'text',
		boolOptions,
		enumOptions,
		codeType,
		dateFormatter = 'YYYY-MM-DD HH:mm:ss',
		timeFormatter = 'HH:mm:ss',
		onLinkClick,
	} = column;
	let props: any = {};
	if (dataType === 'link') {
		props = {
			onLinkClick,
		};
	}
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

	let editRender: any = {
		name: 'LtDefaultRenderTableEdit',
		props: {
			...getProps(column),
		},
	};
	if (editType === 'text') {
		editRender.name = 'LtTextRenderTableEdit';
		editRender.props = getProps(column);
	}
	if (editType === 'number') {
		editRender.name = 'LtNumberRenderTableEdit';
		editRender.props = getProps(column);
	}
	if (editType === 'boolean') {
		editRender.name = 'LtBooleanRenderTableEdit';
		editRender.props = getProps(column);
	}
	if (editType === 'select') {
		editRender.name = 'LtSelectRenderTableEdit';
		editRender.props = getProps(column);
	}
	if (editType === 'date') {
		editRender.name = 'LtDateRenderTableEdit';
		editRender.props = getProps(column);
	}
	if (editType === 'time') {
		editRender.name = 'LtTimeRenderTableEdit';
		editRender.props = getProps(column);
	}

	// 禁用编辑 放在在底部判断
	if (editType === 'disabledEdit') {
		editRender = null;
	}

	return { editRender };
}
