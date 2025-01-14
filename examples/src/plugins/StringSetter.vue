<template>
	<Input v-model:value="value" style="font-size: 12px" />
</template>

<script setup lang="ts">
import { Input } from 'ant-design-vue';
import { ref, useAttrs, watch } from 'vue';

// 获取所有未在props中定义的属性
const attrs = useAttrs();

const value = ref(attrs.value as any);

const emit = defineEmits(['change']);

watch(value, (newValue) => {
	emit('change', newValue);
});
</script>
