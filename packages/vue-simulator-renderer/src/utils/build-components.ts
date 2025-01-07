export function getSubComponent(library: any, paths: string[]) {
	const l = paths.length;
	if (l < 1 || !library) {
		return library;
	}
	let i = 0;
	let component: any;
	while (i < l) {
		const key = paths[i]!;
		let ex: any;
		try {
			component = library[key];
		} catch (e) {
			ex = e;
			component = null;
		}
		if (i === 0 && component == null && key === 'default') {
			if (ex) {
				return l === 1 ? library : null;
			}
			component = library;
		} else if (component == null) {
			return null;
		}
		library = component;
		i++;
	}
	return component;
}
