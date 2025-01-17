// TODO 将组件实例转换为组件元数据，目前思路太混乱先不处理
export function parseMetadata(component: any): any {
	return {
		props: parseProps(component),
		...component.componentMetadata,
	};
}

export function parseProps(component: any) {
	if (!component) {
		return [];
	}
	const { props } = component;

	for (const [key, prop] of Object.entries(props)) {
		const config = {
			name: key,
			type: 'any',
		};
		prop;
		config;
	}

	return {};
}
