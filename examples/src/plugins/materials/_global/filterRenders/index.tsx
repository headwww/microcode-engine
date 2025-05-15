import { VxeUI } from 'vxe-pc-ui';
import { get, isNaN, isNumber, join, split } from 'lodash';
import { AdvancedFilter } from './advanced-filter';
import {
	ComparisonOperator,
	FilterData,
	FilterMode,
	LogicalOperators,
	TemporalOperator,
} from './types';
import { formatTableCell } from '../utils';

VxeUI.renderer.add('LtFilterRender', {
	showTableFilterFooter: false,
	renderTableFilter({ props = {}, attrs = {}, events = {} }, params) {
		return (
			<AdvancedFilter
				key={params.column.field}
				{...props}
				{...attrs}
				{...events}
				params={params}
			/>
		);
	},
	tableFilterMethod(params) {
		const { option, cellValue, row, column } = params;
		const currentMode = option?.data?.currentMode;

		const formatCellValue = formatTableCell({ cellValue, row, column });

		if (currentMode === FilterMode.TEXT) {
			return compareFilter(
				currentMode,
				option?.data?.textFilterData,
				formatCellValue
			);
		}
		if (currentMode === FilterMode.NUMBER) {
			return compareFilter(
				currentMode,
				option?.data?.numberFilterData,
				formatCellValue
			);
		}
		if (currentMode === FilterMode.DATE) {
			return compareFilter(
				currentMode,
				option?.data?.dateFilterData,
				formatCellValue
			);
		}
		if (currentMode === FilterMode.CONTENT) {
			// eslint-disable-next-line no-unsafe-optional-chaining
			const checkedKeys = option?.data?.contentFilterData?.checkedKeys || [];
			if (checkedKeys.includes('$SELECT_ALL')) {
				return true;
			}

			if (!formatCellValue || formatCellValue === '') {
				return checkedKeys.includes('$SELECT_NULL');
			}
			return checkedKeys.includes(formatCellValue);
		}
		if (currentMode === FilterMode.ENTITY) {
			const splitList = split(params.column.field, '.');
			if (splitList.length > 1) {
				splitList.shift();
				const otherKey = join(splitList, '.');
				const arr: string[] = [];
				if (option?.data?.entityFilterData.records.length > 0) {
					option?.data?.entityFilterData.records.forEach((item: any) => {
						arr.push(get(item, otherKey));
					});
				}
				return arr.includes(params.cellValue);
			}
		}

		return false;
	},
	tableFilterResetMethod(params) {
		const {
			resetContentFilter,
			resetDateFilter,
			resetNumberFilter,
			resetTextFilter,
		} = useResetFilter();

		const { options } = params;

		options.forEach((option) => {
			option.data = {
				currentMode: option.data.currentMode,
				textFilterData: resetTextFilter(),
				numberFilterData: resetNumberFilter(),
				dateFilterData: resetDateFilter(),
				contentFilterData: resetContentFilter(),
			};
		});
	},
});

function useResetFilter() {
	function resetTextFilter(): FilterData {
		return {
			logicalOperators: LogicalOperators.AND,
			firstQueryCondition: ComparisonOperator.INCLUDE,
			firstQueryText: '',
			secondQueryCondition: ComparisonOperator.EMPTY,
			secondQueryText: '',
		};
	}
	function resetDateFilter(): FilterData {
		return {
			logicalOperators: LogicalOperators.AND,
			firstQueryCondition: TemporalOperator.EQUALS,
			firstQueryText: '',
			secondQueryCondition: TemporalOperator.EMPTY,
			secondQueryText: '',
		};
	}

	function resetNumberFilter() {
		return resetTextFilter();
	}

	function resetContentFilter() {
		return {
			checkedKeys: ['$SELECT_ALL'],
		};
	}

	function resetEntityFilter() {
		return {
			records: [],
		};
	}

	return {
		resetEntityFilter,
		resetTextFilter,
		resetDateFilter,
		resetNumberFilter,
		resetContentFilter,
	};
}

// 组装比较结果
function compareFilter(
	currentMode: FilterMode,
	filterData: FilterData,
	formatCellValue: any
) {
	const {
		// 逻辑运算符
		logicalOperators,
		// 第一个查询条件
		firstQueryCondition,
		// 第一个查询文本
		firstQueryText,
		// 第二个查询条件
		secondQueryCondition,
		// 第二个查询文本
		secondQueryText,
	} = filterData;

	let firstResult = false;
	let secondResult = false;
	if (currentMode === FilterMode.TEXT) {
		// 第一个比较结果
		firstResult = formatCellValue
			? compareStrings(
					formatCellValue,
					firstQueryText,
					firstQueryCondition as ComparisonOperator
				)
			: false;
		// 第二个比较结果
		secondResult = formatCellValue
			? compareStrings(
					formatCellValue,
					secondQueryText,
					secondQueryCondition as ComparisonOperator
				)
			: false;
	}
	if (currentMode === FilterMode.NUMBER) {
		firstResult =
			isNumber(formatCellValue) &&
			isNumber(firstQueryText) &&
			compareNumbers(
				formatCellValue,
				firstQueryText,
				firstQueryCondition as ComparisonOperator
			);
		secondResult =
			isNumber(formatCellValue) &&
			isNumber(secondQueryText) &&
			compareNumbers(
				formatCellValue,
				secondQueryText,
				secondQueryCondition as ComparisonOperator
			);
	}
	if (currentMode === FilterMode.DATE) {
		firstResult = formatCellValue
			? compareDates(
					formatCellValue,
					firstQueryText,
					firstQueryCondition as TemporalOperator
				)
			: false;
		secondResult = formatCellValue
			? compareDates(
					formatCellValue,
					secondQueryText,
					secondQueryCondition as TemporalOperator
				)
			: false;
	}

	if (secondQueryCondition === ComparisonOperator.EMPTY) {
		return firstResult;
	}

	return logicalOperators === LogicalOperators.AND
		? firstResult && secondResult
		: firstResult || secondResult;
}

// 解析各种日期格式为 Date 对象
function parseDateString(dateStr: string): Date | null {
	if (!dateStr) return null;

	// 标准化处理：先转换中文格式为标准格式
	let normalizedDate = dateStr
		.replace(/年/g, '-')
		.replace(/月/g, '-')
		.replace(/日/g, '')
		.replace(/时/g, ':')
		.replace(/分/g, ':')
		.replace(/秒/g, '');

	// 处理各种格式
	const formats = [
		{ pattern: /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/, format: null }, // YYYY-MM-DD HH:mm:ss
		{ pattern: /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/, format: ':00' }, // YYYY-MM-DD HH:mm
		{ pattern: /^\d{4}-\d{2}-\d{2} \d{2}$/, format: ':00:00' }, // YYYY-MM-DD HH
		{ pattern: /^\d{4}-\d{2}-\d{2}$/, format: null }, // YYYY-MM-DD
		{ pattern: /^\d{4}-\d{2}$/, format: '-01' }, // YYYY-MM
		{ pattern: /^\d{4}$/, format: '-01-01' }, // YYYY
		{ pattern: /^\d{2}:\d{2}:\d{2}$/, format: '1970-01-01 ' }, // HH:mm:ss
		{ pattern: /^\d{2}:\d{2}$/, format: ':00', prefix: '1970-01-01 ' }, // HH:mm
		{ pattern: /^\d{2}$/, format: ':00:00', prefix: '1970-01-01 ' }, // HH
	];

	// 匹配并格式化
	for (const { pattern, format, prefix } of formats) {
		if (pattern.test(normalizedDate)) {
			if (prefix) {
				normalizedDate = prefix + normalizedDate;
			}
			if (format) {
				normalizedDate += format;
			}
			break;
		}
	}

	const date = new Date(normalizedDate);
	return isNaN(date.getTime()) ? null : date;
}

// 比较日期
function compareDates(
	formatCellValue: string,
	queryText: string,
	operator: TemporalOperator
): boolean {
	const cellDate = parseDateString(formatCellValue);
	const queryDate = parseDateString(queryText);

	if (!cellDate || !queryDate) return false;

	switch (operator) {
		case TemporalOperator.EQUALS:
			return cellDate.getTime() === queryDate.getTime();
		case TemporalOperator.NOT_EQUALS:
			return cellDate.getTime() !== queryDate.getTime();
		case TemporalOperator.AFTER:
			return cellDate.getTime() > queryDate.getTime();
		case TemporalOperator.AFTER_OR_SAME:
			return cellDate.getTime() >= queryDate.getTime();
		case TemporalOperator.BEFORE:
			return cellDate.getTime() < queryDate.getTime();
		case TemporalOperator.BEFORE_OR_SAME:
			return cellDate.getTime() <= queryDate.getTime();
		default:
			return false;
	}
}

function compareNumbers(
	formatCellValue: number,
	firstQueryText: number,
	firstQueryCondition: ComparisonOperator
) {
	if (firstQueryCondition === ComparisonOperator.INCLUDE) {
		return formatCellValue.toString().includes(firstQueryText.toString());
	}
	if (firstQueryCondition === ComparisonOperator.EXCLUDE) {
		return !formatCellValue.toString().includes(firstQueryText.toString());
	}
	if (firstQueryCondition === ComparisonOperator.EQUALS) {
		return formatCellValue === firstQueryText;
	}
	if (firstQueryCondition === ComparisonOperator.NOT_EQUALS) {
		return formatCellValue !== firstQueryText;
	}
	if (firstQueryCondition === ComparisonOperator.GREATER_THAN) {
		return formatCellValue > firstQueryText;
	}
	if (firstQueryCondition === ComparisonOperator.GREATER_THAN_OR_EQUAL) {
		return formatCellValue >= firstQueryText;
	}
	if (firstQueryCondition === ComparisonOperator.LESS_THAN) {
		return formatCellValue < firstQueryText;
	}
	if (firstQueryCondition === ComparisonOperator.LESS_THAN_OR_EQUAL) {
		return formatCellValue <= firstQueryText;
	}
	if (firstQueryCondition === ComparisonOperator.STARTS_WITH) {
		return formatCellValue.toString().startsWith(firstQueryText.toString());
	}
	if (firstQueryCondition === ComparisonOperator.DOES_NOT_START_WITH) {
		return !formatCellValue.toString().startsWith(firstQueryText.toString());
	}
	if (firstQueryCondition === ComparisonOperator.ENDS_WITH) {
		return formatCellValue.toString().endsWith(firstQueryText.toString());
	}
	if (firstQueryCondition === ComparisonOperator.DOES_NOT_END_WITH) {
		return !formatCellValue.toString().endsWith(firstQueryText.toString());
	}

	return false;
}

function compareStrings(
	str: string,
	cellValue: string,
	operator: ComparisonOperator
): boolean {
	if (operator === ComparisonOperator.INCLUDE) {
		return str.includes(cellValue);
	}
	if (operator === ComparisonOperator.EXCLUDE) {
		return !str.includes(cellValue);
	}
	if (operator === ComparisonOperator.EQUALS) {
		return str === cellValue;
	}
	if (operator === ComparisonOperator.NOT_EQUALS) {
		return str !== cellValue;
	}
	if (operator === ComparisonOperator.GREATER_THAN) {
		return str > cellValue;
	}
	if (operator === ComparisonOperator.GREATER_THAN_OR_EQUAL) {
		return str >= cellValue;
	}
	if (operator === ComparisonOperator.LESS_THAN) {
		return str < cellValue;
	}
	if (operator === ComparisonOperator.LESS_THAN_OR_EQUAL) {
		return str <= cellValue;
	}
	if (operator === ComparisonOperator.STARTS_WITH) {
		return str.startsWith(cellValue);
	}
	if (operator === ComparisonOperator.DOES_NOT_START_WITH) {
		return !str.startsWith(cellValue);
	}
	if (operator === ComparisonOperator.ENDS_WITH) {
		return str.endsWith(cellValue);
	}
	if (operator === ComparisonOperator.DOES_NOT_END_WITH) {
		return !str.endsWith(cellValue);
	}
	return false;
}
