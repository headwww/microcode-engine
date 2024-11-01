import EventEmitter2 from 'eventemitter2';
import StrictEventEmitter from 'strict-event-emitter-types';
import * as GlobalEvent from '../../event';
import {
	IPublicTypeAssetsJson,
	IPublicTypeEditorGetOptions,
	IPublicTypeEditorGetResult,
	IPublicTypeEditorRegisterOptions,
	IPublicTypeEditorValueKey,
} from '../type';
import { IPublicApiEvent } from '../api';

export interface IPublicModelEditor
	extends StrictEventEmitter<EventEmitter2, GlobalEvent.EventConfig> {
	get: <T = undefined, KeyOrType = any>(
		keyOrType: KeyOrType,
		opt?: IPublicTypeEditorGetOptions
	) => IPublicTypeEditorGetResult<T, KeyOrType> | undefined;

	has: (keyOrType: IPublicTypeEditorValueKey) => boolean;

	set: (key: IPublicTypeEditorValueKey, data: any) => void | Promise<void>;

	/**
	 * 获取 keyOrType 一次
	 */
	onceGot: <T = undefined, KeyOrType extends IPublicTypeEditorValueKey = any>(
		keyOrType: KeyOrType
	) => Promise<IPublicTypeEditorGetResult<T, KeyOrType>>;

	/**
	 * 获取 keyOrType 多次
	 */
	onGot: <T = undefined, KeyOrType extends IPublicTypeEditorValueKey = any>(
		keyOrType: KeyOrType,
		fn: (data: IPublicTypeEditorGetResult<T, KeyOrType>) => void
	) => () => void;

	/**
	 * 监听 keyOrType 变化
	 */
	onChange: <T = undefined, KeyOrType extends IPublicTypeEditorValueKey = any>(
		keyOrType: KeyOrType,
		fn: (data: IPublicTypeEditorGetResult<T, KeyOrType>) => void
	) => () => void;

	register: (
		data: any,
		key?: IPublicTypeEditorValueKey,
		options?: IPublicTypeEditorRegisterOptions
	) => void;

	get eventBus(): IPublicApiEvent;

	setAssets(assets: IPublicTypeAssetsJson): void;
}
