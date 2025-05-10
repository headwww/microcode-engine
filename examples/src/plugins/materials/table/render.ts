import { Ref } from 'vue';
import { VxeColumnPropTypes } from 'vxe-table';
import {
	ComparisonOperator,
	FilterMode,
	LogicalOperators,
	TemporalOperator,
} from '../_global/filterRenders/types';
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
	const { editType, property } = column;

	const topFieldTypeFlag = property?.topFieldTypeFlag;

	// 如果当前字段是这样的corp.name，则需要使用实体编辑
	if (topFieldTypeFlag === '1') {
		return {
			name: 'LtEntityRenderTableEdit',
			props: {
				...getProps(column),
				editDataConfig: column?.editDataConfig,
				editColumns: column?.editColumns,
			},
		};
	}
	if (editType === 'text') {
		return {
			name: 'LtTextRenderTableEdit',
			props: getProps(column),
		};
	}
	if (editType === 'number') {
		return {
			name: 'LtNumberRenderTableEdit',
			props: getProps(column),
		};
	}
	if (editType === 'boolean') {
		return {
			name: 'LtBooleanRenderTableEdit',
			props: getProps(column),
		};
	}
	if (editType === 'select') {
		return {
			name: 'LtSelectRenderTableEdit',
			props: getProps(column),
		};
	}
	if (editType === 'date') {
		return {
			name: 'LtDateRenderTableEdit',
			props: getProps(column),
		};
	}
	if (editType === 'time') {
		return {
			name: 'LtTimeRenderTableEdit',
			props: getProps(column),
		};
	}

	// 禁用编辑 放在在底部判断
	if (editType === 'disabledEdit') {
		return null;
	}

	return {
		name: 'LtDefaultRenderTableEdit',
		props: getProps(column),
	};
}

export function useFilter(
	column: ColumnProps,
	filters: Ref<VxeColumnPropTypes.Filters>
) {
	const obj: VxeColumnPropTypes.FilterItem = {
		label: column.property?.fieldName,
		data: {
			currentMode: '',
		},
	};

	const filterModes = [];
	const fieldType = column.property?.fieldType;
	if (fieldType === 'java.lang.String') {
		filterModes.push(FilterMode.TEXT);
		obj.data = {
			...obj.data,
			textFilterData: {
				logicalOperators: LogicalOperators.AND,
				firstQueryCondition: ComparisonOperator.INCLUDE,
				firstQueryText: '',
				secondQueryCondition: ComparisonOperator.EMPTY,
				secondQueryText: '',
			},
		};
	}
	if (
		fieldType === 'java.lang.Integer' ||
		fieldType === 'java.lang.Long' ||
		fieldType === 'java.math.BigDecimal'
	) {
		filterModes.push(FilterMode.NUMBER);
		obj.data = {
			...obj.data,
			numberFilterData: {
				logicalOperators: LogicalOperators.AND,
				firstQueryCondition: ComparisonOperator.INCLUDE,
				firstQueryText: '',
				secondQueryCondition: ComparisonOperator.EMPTY,
				secondQueryText: '',
			},
		};
	}
	if (fieldType === 'java.util.Date') {
		filterModes.push(FilterMode.DATE);
		obj.data = {
			...obj.data,
			dateFilterData: {
				logicalOperators: LogicalOperators.AND,
				firstQueryCondition: TemporalOperator.EQUALS,
				firstQueryText: '',
				secondQueryCondition: TemporalOperator.EMPTY,
				secondQueryText: '',
			},
		};
	}
	if (column.property?.topFieldTypeFlag === '1') {
		filterModes.push(FilterMode.ENTITY);
	}
	filterModes.push(FilterMode.CONTENT);

	obj.data.currentMode = filterModes.length > 0 ? filterModes[0] : '';
	filters.value.push(obj);

	console.log(filters.value);

	return {
		filterRender: {
			name: 'LtFilterRender',
			props: {
				filterModes,
			},
			events: {
				onChange: (data: any = []) => {
					filters.value = [...data];
				},
			},
		},
	};
}
