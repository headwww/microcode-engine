import {
	IPublicTypeIconType,
	IPublicTypeTitleContent,
	TipContent,
} from '@arvin/microcode-types';
import { isI18nData, isTitleConfig } from '@arvin/microcode-utils';
import { isVNode } from 'vue';

/**
 * 组合生成标题对象，返回包含标题内容、图标和提示信息的配置。
 *
 * @param title - 标题内容，可能是文本、VNode 或其他类型。
 * @param icon - 可选的图标类型，用于显示在标题旁。
 * @param tip - 可选的提示内容，用于显示额外信息。
 * @param tipAsTitle - 布尔值，如果为 true，则将 tip 内容用作标题。
 * @param noIcon - 布尔值，如果为 true，表示标题中不应包含图标。
 *
 * @returns 一个包含 label、icon 和 tip 的标题对象，具体内容由传入的参数决定。
 */
export function composeTitle(
	title?: IPublicTypeTitleContent,
	icon?: IPublicTypeIconType,
	tip?: TipContent,
	tipAsTitle?: boolean,
	noIcon?: boolean
) {
	let _title: IPublicTypeTitleContent | undefined;

	// Step 1: 初始化 _title
	if (!title) {
		// 如果未传入 title，则创建一个空对象并赋给 _title
		_title = {};

		// 如果 icon 不存在或 tipAsTitle 为 true，将 tip 内容作为 label 填入 _title
		if (!icon || tipAsTitle) {
			_title = {
				label: tip as any, // 将 tip 转换并赋值为 _title.label
			};
			tip = undefined; // 清除 tip 内容，避免重复显示
		}
	}

	// 如果传入了 title，则直接将其赋给 _title
	_title = title;

	// Step 2: 处理 _title、icon 和 tip 的组合逻辑
	if (icon || tip) {
		// 当 icon 或 tip 存在时，检查 _title 的类型是否满足特定条件
		if (typeof _title !== 'object' || isVNode(_title) || isI18nData(_title)) {
			// 如果 _title 不是对象，或者是 VNode 或 i18n 数据类型
			if (isVNode(_title)) {
				// 如果 _title 是 VNode，进一步检查它的类型
				if (_title.type === 'svg' || (_title.type as any).getIcon) {
					// 如果 _title 是 svg 或包含 getIcon 方法，将其赋给 icon
					if (!icon) {
						icon = _title;
					}

					// 如果 tipAsTitle 为 true，将 tip 内容替换为标题
					if (tipAsTitle) {
						_title = tip;
						tip = null as any; // 清空 tip
					} else {
						_title = undefined; // 重置 _title
					}
				}
			}

			// 将 _title 重新构造成对象，包含 label、icon 和 tip
			_title = {
				label: _title as any, // 将 _title 转换为 label
				icon,
				tip,
			};
		} else {
			// 如果 _title 是对象，则将 icon 和 tip 添加到 _title
			_title = {
				..._title,
				icon,
				tip,
			};
		}
	}

	// Step 3: 根据 noIcon 移除 icon 属性
	if (isTitleConfig(_title) && noIcon) {
		// 如果 _title 符合 isTitleConfig 配置，并且 noIcon 为 true
		if (!isVNode(_title)) {
			_title.icon = undefined; // 移除 icon 属性
		}
	}

	// 返回最终组合的标题对象
	return _title;
}
