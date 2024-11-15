import { OutputOptions, RollupBuild } from 'rollup';
import { getPackageDependencies } from './pkg';
import { epPackage, rootPackage } from './paths';

export const generateExternal = async (options: { full: boolean }) => {
	const { dependencies, peerDependencies } = getPackageDependencies(epPackage);
	const {
		dependencies: rootDependencies,
		peerDependencies: rootPeerDependencies,
	} = getPackageDependencies(rootPackage);

	return (id: string) => {
		const packages: string[] = [...peerDependencies, ...rootPeerDependencies];
		if (!options.full) {
			packages.push('@vue', 'vue', ...dependencies, ...rootDependencies);
		}

		return [...new Set(packages)].some(
			(pkg) => id === pkg || id.startsWith(`${pkg}/`)
		);
	};
};

/**
 * 写入多个 bundle
 * @param bundle - RollupBuild 实例
 * @param options - OutputOptions 数组
 * @returns Promise<void>
 */
export function writeBundles(bundle: RollupBuild, options: OutputOptions[]) {
	return Promise.all(options.map((option) => bundle.write(option)));
}
