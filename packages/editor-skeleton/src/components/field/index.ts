import { h, VNode } from 'vue';
import { EntryField, Field, PlainField, PopupField } from './fields';
import { FieldProps } from './types';

/**
 * 创建字段
 * @param props 属性
 * @param children 对应的设置器
 * @param type 类型
 * @returns
 */
export function createField(
	props: FieldProps,
	children: VNode,
	type?: 'accordion' | 'inline' | 'block' | 'plain' | 'popup' | 'entry'
) {
	if (type === 'popup') {
		return h(PopupField, props, {
			default: () => children,
		});
	}
	if (type === 'entry') {
		return h(EntryField, props, {
			default: () => children,
		});
	}
	if (type === 'plain' || !props.title) {
		return h(PlainField, props, {
			default: () => children,
		});
	}
	return h(
		Field,
		{ ...props, defaultDisplay: type },
		{
			default: () => children,
		}
	);
}
