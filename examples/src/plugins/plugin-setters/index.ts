import { isJSExpression, isPlainObject } from '@arvin-shu/microcode-utils';
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
	FunctionSetter,
	ObjectSetter,
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

const DataObjectSetter = {
	component: ObjectSetter,
	defaultProps: {},
	title: 'ObjectSetter',
	condition: (field: any) => {
		const v = field.getValue();
		return v == null || isPlainObject(v);
	},
	initialValue: {},
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
		FunctionSetter,
		VariableSetter: DataVariableSetter,
		ObjectSetter: DataObjectSetter,
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
		FunctionSetter,
		VariableSetter: DataVariableSetter,
		ObjectSetter: DataObjectSetter,
	},
	widgets: {
		VariableBindModal,
		EventBindModal,
	},
};

export * from './setters';
export * from './widget';
