<!--
 * @Author: shuwen 1243889238@qq.com
 * @Date: 2024-12-23 15:55:50
 * @LastEditors: shuwen 1243889238@qq.com
 * @LastEditTime: 2024-12-23 22:13:53
 * @FilePath: /microcode-engine/examples/src/A.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
	<div>
		<h1>Hello World</h1>
	</div>
</template>
<script setup lang="ts">
import { ref } from 'vue';

defineProps({
	name: {
		type: String,
		default: 'shuwen',
	},
});

const n = ref(true);
const handleClick = () => {
	n;
};
const handleClick2 = () => {};
n;
handleClick;
handleClick2;
// console.log(getCurrentInstance()?.proxy);
</script>
