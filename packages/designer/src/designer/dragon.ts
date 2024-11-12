/*
 * @Author: shuwen 1243889238@qq.com
 * @Date: 2024-11-06 09:58:44
 * @LastEditors: shuwen 1243889238@qq.com
 * @LastEditTime: 2024-11-11 16:54:42
 * @FilePath: /microcode-engine/packages/designer/src/designer/dragon.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import {
	IPublicModelDragObject,
	IPublicModelDragon,
} from '@arvin/microcode-types';
import { createModuleEventBus, IEventBus } from '@arvin/microcode-editor-core';
import { IDesigner } from './designer';
import { makeEventsHandler } from '../utils';

export interface IDragon extends IPublicModelDragon {
	emitter: IEventBus;
}

export class Dragon implements IDragon {
	emitter: IEventBus = createModuleEventBus('Dragon');

	constructor(readonly designer: IDesigner) {
		designer;
	}

	/**
	 * 快速监听shell（容器元素）拖动行为
	 *
	 * @param shell 容器元素
	 * @param boost 拖拽的对象
	 * @returns
	 */
	from(
		shell: Element,
		boost: (e: MouseEvent) => IPublicModelDragObject | null
	) {
		const mousedown = (e: MouseEvent) => {
			// ESC or RightClick
			if (e.which === 3 || e.button === 2) {
				return;
			}
			const dragObject = boost(e);
			if (!dragObject) {
				return;
			}
			this.boost(dragObject, e);
		};
		shell.addEventListener('mousedown', mousedown as any);
		return () => {
			shell.removeEventListener('mousedown', mousedown as any);
		};
	}

	/**
	 * 发射拖拽对象
	 *
	 * @param dragObject 拖拽对象
	 * @param boostEvent 拖拽初始时事件
	 */
	boost(
		dragObject: IPublicModelDragObject,
		boostEvent: MouseEvent | DragEvent
	) {
		const handleEvents = makeEventsHandler(boostEvent);

		const move = (e: MouseEvent | DragEvent) => {
			console.log(e);
		};
		const over = (e?: any) => {
			console.log(e);

			// 发送目标组件
			this.emitter.emit('dragend', { dragObject });

			handleEvents((doc) => {
				doc.removeEventListener('mousemove', move, true);
				doc.removeEventListener('mouseup', over, true);
				doc.removeEventListener('mousedown', over, true);
			});
		};
		handleEvents((doc) => {
			doc.addEventListener('mousemove', move, true);
			doc.addEventListener('mouseup', over, true);
			doc.addEventListener('mousedown', over, true);
		});
	}

	onDragend(
		func: (x: { dragObject: IPublicModelDragObject; copy: boolean }) => any
	) {
		this.emitter.on('dragend', func);
		return () => {
			this.emitter.removeListener('dragend', func);
		};
	}
}
