import { createIntl } from '@arvin-shu/microcode-editor-core';
import enUS from './en-US';
import zhCN from './zh-CN';

const intlLocal = () => {
	const { getLocale } = createIntl({
		'en-US': enUS,
		'zh-CN': zhCN,
	});
	const locale: string = getLocale?.() || 'zh-CN';
	const localeSource: any = {
		'en-US': enUS,
		'zh-CN': zhCN,
	};
	return localeSource[locale];
};

export const layoutConfig = intlLocal();
