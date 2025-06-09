import {
	isJSExpression,
	isJSFunction,
	isPlainObject,
} from '@arvin-shu/microcode-utils';
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
	ArraySetter,
	TextareaSetter,
	RadioGroupSetter,
	SelectSetter,
	MultipleSelectSetter,
	SegmentedSetter,
	StyleSetter,
	TreeArraySetter,
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

const FunctionBindSetter = {
	component: FunctionSetter,
	title: '函数绑定',
	condition: (field: any) => {
		const v = field.getValue();
		return isJSFunction(v);
	},

	valueType: ['JSFunction'],
};

const DataJsonSetter = {
	component: JsonSetter,
	valueType: ['object', 'array'],
};

const DataArraySetter = {
	component: ArraySetter,
	defaultProps: {},
	title: 'ArraySetter',
	condition: (field: any) => {
		const v = field.getValue();
		return v == null || Array.isArray(v);
	},
	initialValue: [],
	recommend: true,
	valueType: ['array'],
};

const DataTreeArraySetter = {
	component: TreeArraySetter,
	defaultProps: {},
	title: 'TreeArraySetter',
	condition: (field: any) => {
		const v = field.getValue();
		return v == null || Array.isArray(v);
	},
	initialValue: [],
	recommend: true,
	valueType: ['array'],
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
		JsonSetter: DataJsonSetter,
		EventsSetter,
		ArraySetter: DataArraySetter,
		TreeArraySetter: DataTreeArraySetter,
		FunctionSetter: FunctionBindSetter,
		VariableSetter: DataVariableSetter,
		ObjectSetter: DataObjectSetter,
		TextareaSetter,
		RadioGroupSetter,
		SelectSetter,
		SegmentedSetter,
		MultipleSelectSetter,
		StyleSetter,
	},
	setterMap: {
		BoolSetter,
		TextareaSetter,
		MixedSetter,
		StringSetter,
		NumberSetter,
		ClassSetter,
		ColorSetter,
		JsonSetter: DataJsonSetter,
		EventsSetter,
		ArraySetter: DataArraySetter,
		TreeArraySetter: DataTreeArraySetter,
		FunctionSetter: FunctionBindSetter,
		VariableSetter: DataVariableSetter,
		ObjectSetter: DataObjectSetter,
		RadioGroupSetter,
		SelectSetter,
		SegmentedSetter,
		MultipleSelectSetter,
		StyleSetter,
	},
	widgets: {
		VariableBindModal,
		EventBindModal,
	},
};

export * from './setters';
export * from './widget';
