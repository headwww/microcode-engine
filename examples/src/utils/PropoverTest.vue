<template>
	<div>
		<Popover title="Title" trigger="click">
			<template #content>
				<p>Content</p>
				<p>Content</p>
			</template>
			<button>Click me</button>
		</Popover>
	</div>
</template>
<script setup lang="ts">
import { Popover } from 'ant-design-vue';
</script>
