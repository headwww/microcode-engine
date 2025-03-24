import { isJSExpression } from '@arvin-shu/microcode-utils';
import {
	BoolSetter,
	MixedSetter,
	StringSetter,
	VariableSetter,
	NumberSetter,
	ClassSetter,
	ColorSetter,
	JsonSetter,
	EventsSetter,
} from './setters';
import { VariableBindModal, EventBindModal } from './widget';

const DataVariableSetter = {
	component: VariableSetter,
	condition: (field: any) => {
		const v = field.getValue();
		return isJSExpression(v);
	},
	valueType: ['JSExpression'],
	title: '变量输入',
	recommend: true,
};

export const engineExt = {
	setters: {
		BoolSetter,
		MixedSetter,
		StringSetter,
		NumberSetter,
		ClassSetter,
		ColorSetter,
		JsonSetter,
		EventsSetter,
		VariableSetter: DataVariableSetter,
	},
	setterMap: {
		BoolSetter,
		MixedSetter,
		StringSetter,
		NumberSetter,
		ClassSetter,
		ColorSetter,
		JsonSetter,
		EventsSetter,
		VariableSetter: DataVariableSetter,
	},
	widgets: {
		VariableBindModal,
		EventBindModal,
	},
};

export * from './setters';
export * from './widget';
