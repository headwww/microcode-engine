import { Component, VNode } from 'vue';
import { IPublicTypeIconConfig } from '.';

export type IPublicTypeIconType =
	| string
	| VNode
	| Component
	| IPublicTypeIconConfig;
