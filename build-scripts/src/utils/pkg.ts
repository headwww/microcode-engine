import type { ProjectManifest } from '@pnpm/types';

export const getPackageManifest = (pkgPath: string) =>
	// eslint-disable-next-line @typescript-eslint/no-var-requires, import/no-dynamic-require, global-require
	require(pkgPath) as ProjectManifest;

export const getPackageDependencies = (
	pkgPath: string
): Record<'dependencies' | 'peerDependencies' | 'name', string[]> => {
	const manifest = getPackageManifest(pkgPath);
	const { dependencies = {}, peerDependencies = {}, name } = manifest;

	return {
		name,
		dependencies: Object.keys(dependencies),
		peerDependencies: Object.keys(peerDependencies),
	};
};
