<script setup lang="ts">
import {
	MicrocodeWorkbench,
	project,
	skeleton,
} from '@arvin-shu/microcode-engine';
import { EditorConfig } from '@arvin-shu/microcode-types';
import schema from './plugins/schema';

// import { http } from './utils/http';
// http.post({ url: 'api/login', data: ['system', '123456'] });

const config: EditorConfig = {
	lifeCycles: {
		init: () => {
			skeleton.remove({
				area: 'leftArea',
				type: 'Dock',
				name: 'opener',
			});
			project.importSchema(schema as any);
		},
		destroy: (e: any) => {
			console.log('destroy', e);
		},
	},
};
</script>

<template>
	<MicrocodeWorkbench
		:config="config"
		className="engine-main"
	></MicrocodeWorkbench>
</template>
