import { Component } from 'vue';

import {
	IPublicTypeComponentSchema,
	IPublicTypeNpmInfo,
} from '@arvin-shu/microcode-types';

export interface ComponentRecord {
	did: string;
	nid: string;
	cid: number;
}

export interface SimulatorViewLayout {
	Component?: Component;
	componentName?: string;
	props?: Record<string, unknown>;
}
export type MixedComponent =
	| IPublicTypeNpmInfo
	| Component
	| IPublicTypeComponentSchema;
