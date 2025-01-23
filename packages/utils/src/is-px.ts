import { isNaN } from 'lodash';

export function isPx(value: any) {
	return typeof value === 'string' && /px$/i.test(value);
}

export function isNumber(value: any) {
	return (
		typeof value === 'number' ||
		(!isNaN(Number(value)) && !value.includes('px'))
	);
}

export function toPx(value: any) {
	if (typeof value === 'number') {
		return `${value}px`;
	}
	if (isPx(value)) {
		return value;
	}
	// 判断是否为数字字符串
	if (typeof value === 'string' && !isNaN(Number(value))) {
		return `${value}px`;
	}
	throw new Error('Value must be a number or px string');
}
