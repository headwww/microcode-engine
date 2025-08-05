<script setup lang="ts">
import {
	MicrocodeWorkbench,
	project,
	skeleton,
} from '@arvin-shu/microcode-engine';
import { EditorConfig } from '@arvin-shu/microcode-types';
import { h } from 'vue';
import { WalletFilled } from '@ant-design/icons-vue';
import schema from './plugins/schema';

// import { http } from './utils/http';
// http.post({ url: 'api/login', data: ['system', '123456'] });

const config: EditorConfig = {
	lifeCycles: {
		init: () => {
			skeleton.add({
				area: 'leftArea',
				type: 'Dock',
				name: 'opener',
				props: {
					icon: h(WalletFilled), // Icon 组件实例
					align: 'bottom',
					onClick() {
						// 打开外部链接
						window.open('http://www.ltscm.com.cn/');
					},
				},
			});
			const projectSchema = localStorage.getItem('lt_microcode_project')
				? JSON.parse(localStorage.getItem('lt_microcode_project') || '{}')
				: schema;
			project.importSchema(projectSchema as any);
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
