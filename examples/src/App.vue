<!--
 * @Author: shuwen 1243889238@qq.com
 * @Date: 2024-09-29 00:58:16
 * @LastEditors: shuwen 1243889238@qq.com
 * @LastEditTime: 2025-02-10 19:59:12
 * @FilePath: /microcode-engine/examples/src/App.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<script setup lang="ts">
import { MicrocodeWorkbench } from '@arvin-shu/microcode-engine';
import { EditorConfig } from '@arvin-shu/microcode-types';
import { defaultScope } from './scope';

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
	<defaultScope></defaultScope>
	<MicrocodeWorkbench
		:config="config"
		className="engine-main"
	></MicrocodeWorkbench>
</template>
