<script setup lang="ts">
import { h } from 'vue';

const a = () => h('div', { class: 'iii' });
</script>

<template>
	<div>
		<component :is="a"></component>
	</div>
</template>
