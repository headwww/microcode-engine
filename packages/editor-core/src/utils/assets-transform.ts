import { IPublicTypeAssetsJson } from '@arvin-shu/microcode-types';

export function assetsTransform(assets: IPublicTypeAssetsJson) {
	// const { components, packages } = assets;

	// 将packages组装成一个map
	// const packageMaps = packages?.reduce(
	// 	(acc: Record<string, IPublicTypePackage>, cur: IPublicTypePackage) => {
	// 		const key = cur.id || cur.package || '';
	// 		acc[key] = cur;
	// 		return acc;
	// 	},
	// 	{}
	// );

	// components.forEach(
	// 	(
	// 		componentDesc:
	// 			| IPublicTypeComponentDescription
	// 			| IPublicTypeRemoteComponentDescription
	// 	) => {
	// 		let { devMode } = componentDesc;
	// 		if (devMode === 'microCode') {
	// 			devMode = 'microCode';
	// 		} else if (devMode === 'proCode') {
	// 			devMode === 'proCode';
	// 		}
	// 		if (devMode) {
	// 			componentDesc.devMode = devMode;
	// 		}
	// 		console.log(devMode);
	// 	}
	// );

	return assets;
}
