import {
	IPublicTypeI18nData,
	IPublicTypeTitleConfig,
} from '@arvin-shu/microcode-types';
import {
	createIcon,
	isI18nData,
	isTitleConfig,
} from '@arvin-shu/microcode-utils';
import { defineComponent, h, isVNode, VNode } from 'vue';
import { intl } from '../../inti';
import { Tip } from '../tip';

/**
 * 根据 keywords 将 label 分割成文字片段
 * 示例：title = '自定义页面布局'，keywords = '页面'，返回结果为 ['自定义', '页面', '布局']
 * @param label title
 * @param keywords 关键字
 * @returns 文字片段列表
 */
function splitLabelByKeywords(label: string, keywords: string): string[] {
	const len = keywords.length;
	const fragments = [];
	let str = label;

	while (str.length > 0) {
		const index = str.indexOf(keywords);

		if (index === 0) {
			fragments.push(keywords);
			str = str.slice(len);
		} else if (index < 0) {
			fragments.push(str);
			str = '';
		} else {
			fragments.push(str.slice(0, index));
			str = str.slice(index);
		}
	}
	return fragments;
}

export const Title = defineComponent({
	name: 'CustomTitle',
	props: {
		title: [String, Object, Function],
		className: String,
		match: Boolean,
		keywords: String,
		onClick: Function,
	},
	setup(props) {
		const handleClick = (e: MouseEvent) => {
			const { onClick, title } = props;
			const url = (title as any)?.docUrl || (title as any)?.url;
			if (url) {
				window.open(url);
				e.stopPropagation(); // 防止触发行操作（如折叠面板）
			}
			onClick && onClick(e);
		};

		const renderLabel = (label: string | IPublicTypeI18nData | VNode) => {
			const { match, keywords } = props;

			if (!label) {
				return null;
			}

			const intlLabel = intl(label as any);

			if (typeof intlLabel !== 'string') {
				return <span className="mtc-title-txt">{intlLabel}</span>;
			}

			let labelToRender = intlLabel;

			if (match && keywords) {
				const fragments = splitLabelByKeywords(intlLabel as string, keywords);

				labelToRender = fragments.map((f) => (
					<span style={{ color: f === keywords ? 'red' : 'inherit' }}>{f}</span>
				)) as any;
			}

			return <span className="mtc-title-txt">{labelToRender}</span>;
		};

		return () => {
			const { className, title } = props;
			let _title: IPublicTypeTitleConfig;
			if (title == null) {
				return null;
			}
			if (isVNode(title)) {
				return title;
			}
			if (typeof title === 'string' || isI18nData(title)) {
				_title = { label: title } as IPublicTypeTitleConfig;
			} else if (isTitleConfig(title)) {
				_title = title;
			} else {
				_title = {
					label: title,
				} as IPublicTypeTitleConfig;
			}

			const icon = _title.icon
				? createIcon(_title.icon, {
						style: {
							fontSize: '20px',
						},
					})
				: null;

			let tip: any = null;
			if (_title.tip) {
				if (isVNode(_title.tip) && _title.tip.type === Tip) {
					tip = _title.tip;
				} else {
					const tipProps =
						typeof _title.tip === 'object' &&
						!(isVNode(_title.tip) || isI18nData(_title.tip))
							? _title.tip
							: { children: _title.tip };
					tip = h(Tip, {
						...tipProps,
					} as any);
				}
			}

			return (
				<span
					class={{
						'mtc-title': true,
						[className || '']: !!className,
						'has-tip': !!tip,
						'only-icon': !_title.label,
					}}
					onClick={handleClick}
				>
					{icon ? <b class="mtc-title-icon">{icon}</b> : null}
					{renderLabel(_title.label as any)}
					{tip}
				</span>
			);
		};
	},
});
