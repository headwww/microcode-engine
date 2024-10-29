import { ISkeleton } from '@arvin/microcode-editor-skeleton';
import {
	IPublicApiSkeleton,
	IPublicModelSkeletonItem,
	IPublicTypeSkeletonConfig,
} from '@arvin/microcode-types';
import { globalContext } from '@arvin/microcode-editor-core';
import { getLogger } from '@arvin/microcode-utils';
import { skeletonSymbol } from '../symbols';

const innerSkeletonSymbol = Symbol('skeleton');

const logger = getLogger({ level: 'warn', bizName: 'shell-skeleton' });

export class Skeleton implements IPublicApiSkeleton {
	private readonly pluginName: string;

	private readonly [innerSkeletonSymbol]: ISkeleton;

	get [skeletonSymbol](): ISkeleton {
		if (this.workspaceMode) {
			return this[innerSkeletonSymbol];
		}
		const workspace = globalContext.get('workspace');
		if (workspace.isActive) {
			if (!workspace.window?.innerSkeleton) {
				logger.error('skeleton api 调用时机出现问题，请检查');
				return this[innerSkeletonSymbol];
			}
			return workspace.window.innerSkeleton;
		}

		return this[innerSkeletonSymbol];
	}

	constructor(
		skeleton: ISkeleton,
		pluginName: string,
		readonly workspaceMode: boolean = false
	) {
		this[innerSkeletonSymbol] = skeleton;
		this.pluginName = pluginName;
	}

	add(
		config: IPublicTypeSkeletonConfig,
		extraConfig?: Record<string, any>
	): IPublicModelSkeletonItem | undefined {
		const configWithName = {
			...config,
			pluginName: this.pluginName,
		};
		console.log(configWithName, extraConfig);
		return undefined;
	}
}
