/*
 * @Author: shuwen 1243889238@qq.com
 * @Date: 2025-01-08 10:03:49
 * @LastEditors: shuwen 1243889238@qq.com
 * @LastEditTime: 2025-01-10 17:35:49
 * @FilePath: /microcode-engine/examples/src/plugins/plugin-init-setter.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { IPublicModelPluginContext } from '@arvin-shu/microcode-types';
import StringSetter from './StringSetter.vue';
import BoolSetter from './BoolSetter.vue';

const InitSetter = (ctx: IPublicModelPluginContext) => ({
	async init() {
		const { setters } = ctx;
		setters.registerSetter('StringSetter', StringSetter);
		setters.registerSetter('BoolSetter', BoolSetter);
		setters.registerSetter('StringSetter1', {
			component: StringSetter,
			title: 'StringSetter1',
			initialValue: () => {
				console.log('-------');
			},
		});

		console.log(setters.getSettersMap());
	},
});

InitSetter.pluginName = 'InitSetter';

export default InitSetter;
