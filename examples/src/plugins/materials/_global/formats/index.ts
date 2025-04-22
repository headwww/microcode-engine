import { VxeUI } from 'vxe-pc-ui';
import dayjs from 'dayjs';
import { isArray, isNumber } from 'lodash-es';
import XEUtils from 'xe-utils';
// 保留几位小数、默认两位，和加单位
VxeUI.formats.add('LtFixedUnitFormatter', {
	cellFormatMethod({ cellValue }, digits, unit = '') {
		if (digits) {
			if (cellValue || cellValue === 0) {
				return XEUtils.commafy(XEUtils.toNumber(cellValue), { digits }) + unit;
			}
			return cellValue;
		}
		return cellValue;
	},
});

// 格式化日期默认是yyyy-MM-dd HH:mm:ss
VxeUI.formats.add('LtDateFormatter', {
	cellFormatMethod({ cellValue }, format = 'YYYY-MM-DD HH:mm:ss') {
		if (cellValue) {
			return dayjs(cellValue).format(format);
		}
		return cellValue;
	},
});

// 格式化time 时分秒
VxeUI.formats.add('LtTimeFormatter', {
	cellFormatMethod({ cellValue }) {
		if (isNumber(cellValue)) {
			return dayjs(cellValue).format('HH:mm:ss');
		}
		return cellValue;
	},
});

// 格式化枚举 bool ['LtFormatterEnumKeyValue',[{text:string,value:string},{key:string,value:string}]]
VxeUI.formats.add('LtOptionFormatter', {
	cellFormatMethod({ cellValue }, options) {
		if (options && isArray(options)) {
			const obj = options.find((item) => {
				if (item.value !== undefined) {
					// 处理布尔值的情况
					if (
						typeof item.value === 'boolean' &&
						typeof cellValue === 'boolean'
					) {
						return item.value === cellValue;
					}
					// 处理其他类型
					return item.value === cellValue;
				}
				return false;
			});

			if (obj && obj.value !== undefined) {
				return obj.text;
			}
			return cellValue;
		}
		return cellValue;
	},
});
