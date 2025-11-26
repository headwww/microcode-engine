<!--
 * @Author: shuwen 1243889238@qq.com
 * @Date: 2025-11-25 10:07:39
 * @LastEditors: shuwen 1243889238@qq.com
 * @LastEditTime: 2025-11-26 14:52:46
 * @FilePath: /microcode-engine/examples/src/Work3.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<script setup lang="ts">
import {
	Workbench,
	Skeleton as InnerSkeleton,
} from '@arvin-shu/microcode-editor-skeleton';
import { Skeleton } from '@arvin-shu/microcode-shell';
import { h } from 'vue';
import { project } from '@arvin-shu/microcode-engine';
import { EditorConfig } from '@arvin-shu/microcode-types';
import { WalletFilled } from '@ant-design/icons-vue';
import { Editor } from '@arvin-shu/microcode-editor-core';
import schema from './plugins/schema';

const editor = new Editor();
const innerSkeleton = new InnerSkeleton(editor);
const skeleton = new Skeleton(innerSkeleton as any, 'any', false);

const config: EditorConfig = {
	lifeCycles: {
		init: () => {
			skeleton.add({
				area: 'leftArea',
				type: 'PanelDock',
				name: 'PaneComponent',
				panelProps: {
					title: '组件',
				},
				content: h('div'),
				props: {
					align: 'top',
					icon: h(WalletFilled), // Icon 组件实例
					description: '组件',
				},
			});
			skeleton.add({
				area: 'leftArea',
				type: 'PanelDock',
				name: 'PaneComponent12',
				panelProps: {
					title: '组件12',
				},
				content: h('div'),
				props: {
					align: 'bottom',
					icon: h(WalletFilled), // Icon 组件实例
					description: '组件',
				},
			});
			const projectSchema = localStorage.getItem('lt_microcode_project')
				? JSON.parse(localStorage.getItem('lt_microcode_project') || '{}')
				: schema;
			console.log(projectSchema);

			project.importSchema(projectSchema as any);
		},
		destroy: (e: any) => {
			console.log('destroy', e);
		},
	},
};
</script>

<template>
	<Workbench
		:config="config"
		:skeleton="innerSkeleton"
		className="engine-main"
	></Workbench>
</template>
