import {
	IPublicTypeComponentInstance,
	IPublicTypeSimulatorRenderer,
} from '@arvin-shu/microcode-types';
import { Component } from 'vue';

export type BuiltinSimulatorRenderer = IPublicTypeSimulatorRenderer<
	Component<any> | object,
	IPublicTypeComponentInstance
>;

export function isSimulatorRenderer(obj: any): obj is BuiltinSimulatorRenderer {
	return obj && obj.isSimulatorRenderer;
}
