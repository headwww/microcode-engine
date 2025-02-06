import {
	IPublicTypeAssetsJson,
	IPublicTypeComponentDescription,
	IPublicTypePackage,
	IPublicTypeRemoteComponentDescription,
} from '@arvin-shu/microcode-types';

export function assetsTransform(assets: IPublicTypeAssetsJson) {
	const { components, packages } = assets;
	const packageMaps = (packages || []).reduce(
		(acc: Record<string, IPublicTypePackage>, cur: IPublicTypePackage) => {
			const key = cur.id || cur.package || '';
			acc[key] = cur;
			return acc;
		},
		{} as any
	);
	components.forEach(
		(
			componentDesc:
				| IPublicTypeComponentDescription
				| IPublicTypeRemoteComponentDescription
		) => {
			let { devMode } = componentDesc;
			const { schema, reference } = componentDesc;
			if ((devMode as string) === 'microCode') {
				devMode = 'microCode';
			} else if (devMode === 'proCode') {
				devMode = 'proCode';
			}
			if (devMode) {
				componentDesc.devMode = devMode;
			}
			if (devMode === 'microCode' && !schema && reference) {
				const referenceId = reference.id || '';
				componentDesc.schema = packageMaps[referenceId].schema as any;
			}
		}
	);
	return assets;
}
