import { IPublicModelPluginContext } from '@arvin-shu/microcode-types';
import { engineExt } from './plugin-setters';
import { PropertySetter } from './biz-setters/setters/property-setter';

const InitSetter = (ctx: IPublicModelPluginContext) => ({
	async init() {
		const { setters, skeleton } = ctx;
		setters.registerSetter(engineExt.setters);
		setters.registerSetter('PropertySetter', PropertySetter);

		const VariableBindDialog = engineExt.widgets.VariableBindModal;
		const EventBindModal = engineExt.widgets.EventBindModal;
		skeleton.add({
			area: 'centerArea',
			type: 'Widget',
			content: <VariableBindDialog></VariableBindDialog>,
			name: 'variableBindDialog',
			props: {},
		});

		skeleton.add({
			area: 'centerArea',
			type: 'Widget',
			content: <EventBindModal></EventBindModal>,
			name: 'eventBindModal',
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
