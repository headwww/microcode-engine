import { IPublicModelPluginContext } from '@arvin-shu/microcode-types';

// TODO 没有实现具体的热键
export const builtinHotkey = (ctx: IPublicModelPluginContext) => ({
	init() {
		const { hotkey } = ctx;
		hotkey.bind(['backspace', 'del'], (e: KeyboardEvent) => {
			console.log('backspace', e);
		});
	},
});

builtinHotkey.pluginName = 'builtin_hotkey';
