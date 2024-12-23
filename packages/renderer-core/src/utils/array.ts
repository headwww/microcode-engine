import { isArray } from './check';

export function ensureArray<T>(val: T | T[] | undefined | null): T[] {
	return val ? (isArray(val) ? val : [val]) : [];
}
