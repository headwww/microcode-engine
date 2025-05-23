import { createIntl } from '@arvin-shu/microcode-editor-core';
import enUS from './en-US.json';
import zhCN from './zh-CN.json';

const { intl } = createIntl({
	'en-US': enUS,
	'zh-CN': zhCN,
});

export { intl };
