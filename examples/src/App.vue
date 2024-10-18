<script setup lang="ts">
import { h } from 'vue';
import { A } from './A';
import Ap from './A.vue';

const a = () => h('div', { class: 'iii' });
console.log(h(Ap));

const s = new A();
</script>

<template>
	<div>
		{{ s.a }}
		<button @click="s.add()">1111</button>
		<component :is="a"></component>
	</div>
</template>
