<script setup lang="ts">
import { Workbench } from '@arvin/microcode-engine';
import { EditorConfig } from '@arvin/microcode-types';

const config: EditorConfig = {
	lifeCycles: {
		init: (e: any) => {
			console.log('init', e.context.value);
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
	<Workbench :config="config" className="engine-main"></Workbench>
</template>
