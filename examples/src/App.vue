<script setup lang="ts">
import { MicrocodeWorkbench } from '@arvin-shu/microcode-engine';
import { EditorConfig } from '@arvin-shu/microcode-types';
import A from './A.vue';

const config: EditorConfig = {
	lifeCycles: {
		init: (e: any) => {
			e;
			// console.log('init', e.context.value);
		},
		destroy: (e: any) => {
			console.log('destroy', e);
		},
	},
	hooks: [
		{
			type: 'on',
			message: 'hooks1',
			handler: (e: any) => {
				console.log('hooks', e);
			},
		},
		{
			type: 'once',
			message: 'hooks2',
			handler: (e: any) => {
				console.log('hooks', e);
			},
		},
	],
};
</script>

<template>
	<A cs="width: 100%; height: 100%"></A>
	<MicrocodeWorkbench
		:config="config"
		className="engine-main"
	></MicrocodeWorkbench>
</template>
