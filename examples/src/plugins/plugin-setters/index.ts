import { isJSExpression } from '@arvin-shu/microcode-utils';
import {
	BoolSetter,
	MixedSetter,
	StringSetter,
	VariableSetter,
} from './setters';
import { VariableBindModal } from './widget';

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
		VariableSetter: DataVariableSetter,
	},
	setterMap: {
		BoolSetter,
		MixedSetter,
		StringSetter,
		VariableSetter: DataVariableSetter,
	},
	widgets: {
		VariableBindModal,
	},
};

export * from './setters';
export * from './widget';
