import { IPublicModelSkeletonItem } from '../model';
import { IPublicTypeSkeletonConfig } from '../type';

export interface IPublicApiSkeleton {
	add(
		config: IPublicTypeSkeletonConfig,
		extraConfig?: Record<string, any>
	): IPublicModelSkeletonItem | undefined;
}
