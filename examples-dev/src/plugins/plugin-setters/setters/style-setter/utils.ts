import { parseInt } from 'lodash-es';

export function removeUnit(value: string) {
	if (value !== undefined && value != null) {
		return parseInt(value);
	}

	return undefined;
}

export function addUnit(value: number | string, unit: string) {
	if (value !== undefined && value != null) {
		return value + unit;
	}
	return undefined;
}
