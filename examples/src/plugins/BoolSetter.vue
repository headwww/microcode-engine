<!-- Start of Selection -->
<template>
	<Switch v-model:checked="value" />
</template>

<script setup lang="ts">
import { Switch } from 'ant-design-vue';
import { ref, watch } from 'vue';

const props = defineProps({
	value: {
		type: Boolean,
		default: false,
	},
});

const value = ref(props.value);
// 获取所有未在props中定义的属性
const emit = defineEmits(['change']);

watch(value, (newValue) => {
	emit('change', newValue);
});
</script>
