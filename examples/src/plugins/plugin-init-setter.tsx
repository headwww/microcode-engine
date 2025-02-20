import { IPublicModelPluginContext } from '@arvin-shu/microcode-types';
import { engineExt } from './plugin-setters';

const InitSetter = (ctx: IPublicModelPluginContext) => ({
	async init() {
		const { setters, skeleton } = ctx;
		setters.registerSetter(engineExt.setters);

		const VariableBindDialog = engineExt.widgets.VariableBindModal;
		skeleton.add({
			area: 'centerArea',
			type: 'Widget',
			content: <VariableBindDialog></VariableBindDialog>,
			name: 'variableBindDialog',
			props: {},
		});

		// setters.registerSetter('StringSetter1', {
		// 	component: StringSetter,
		// 	title: 'StringSetter1',
		// 	initialValue: () => {
		// 		console.log('-------');
		// 	},
		// });

		// console.log(setters.getSettersMap());
	},
});

InitSetter.pluginName = 'InitSetter';

export default InitSetter;
