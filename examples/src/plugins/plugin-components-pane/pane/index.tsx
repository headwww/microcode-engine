import { defineComponent, onMounted, ref } from 'vue';

// TODO 还需完善
export default defineComponent({
	setup() {
		const { material, canvas } = window.ArvinMicrocodeEngine;

		onMounted(() => {
			initComponentList();
		});

		const components = ref<any[]>([]);

		function initComponentList() {
			const rawData = material.getAssets();
			canvas;
			const rawComponents = rawData.components || [];
			components.value = [...rawComponents];
		}

		return () => (
			<div style={{ display: 'flex', flexWrap: 'wrap' }}>
				{components.value.map((item: any, index: number) => (
					<div
						key={index}
						ref={(el: any) => {
							if (el) {
								canvas.dragon.from(el, () => ({
									type: 'nodedata',
									data: item.snippets.length > 0 ? item.snippets[0].schema : {},
								}));
							}
						}}
						data-id={
							item.snippets.length > 0
								? item.snippets[0].schema.componentName
								: ''
						}
						style={{
							width: '100px',
							height: '100px',
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
							justifyContent: 'center',
							border: '1px solid #e8e8e8',
							borderRadius: '4px',
							margin: '10px',
						}}
					>
						<img
							style={{ width: '56px', height: '56px', alignItems: 'center' }}
							src={item.snippets[0].screenshot}
						/>
						<div style={{ textAlign: 'center', wordBreak: 'break-all' }}>
							{item.title}
						</div>
					</div>
				))}
			</div>
		);
	},
});
