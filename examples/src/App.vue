<script setup lang="ts">
import { MicrocodeWorkbench } from '@arvin-shu/microcode-engine';
import { EditorConfig } from '@arvin-shu/microcode-types';
// import { http } from './utils/http';
// http.post({ url: 'api/login', data: ['system', '123456'] });

const config: EditorConfig = {
	lifeCycles: {
		init: (e: any) => {
			console.log('init', e);
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
	<MicrocodeWorkbench
		:config="config"
		className="engine-main"
	></MicrocodeWorkbench>
</template>
