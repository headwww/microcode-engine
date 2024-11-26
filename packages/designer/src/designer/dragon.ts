import {
	IPublicModelDragObject,
	IPublicModelDragon,
	IPublicModelLocateEvent,
} from '@arvin-shu/microcode-types';
import {
	createModuleEventBus,
	IEventBus,
} from '@arvin-shu/microcode-editor-core';
import { ref } from 'vue';
import { IDesigner } from './designer';
import { makeEventsHandler } from '../utils';
import { ISimulatorHost } from '../simulator';
import { isShaken } from './utils';

export interface ILocateEvent extends IPublicModelLocateEvent {
	readonly type: 'LocateEvent';
}

export interface IDragon extends IPublicModelDragon<ILocateEvent> {
	emitter: IEventBus;
}

export class Dragon implements IDragon {
	emitter: IEventBus = createModuleEventBus('Dragon');

	private _dragging = ref(false);

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
		const masterSensors = this.getMasterSensors() as ISimulatorHost[];

		const handleEvents = makeEventsHandler(boostEvent, masterSensors);

		this._dragging.value = false;

		const dragstart = () => {
			this._dragging.value = true;
			const locateEvent = createLocateEvent(boostEvent);
			this.emitter.emit('dragstart', locateEvent);
		};

		const drag = (e: MouseEvent | DragEvent) => {
			const locateEvent = createLocateEvent(e);
			this.emitter.emit('drag', locateEvent);
		};

		const move = (e: MouseEvent | DragEvent) => {
			if (this._dragging.value) {
				drag(e);
				return;
			}

			if (isShaken(boostEvent, e)) {
				dragstart();
				drag(e);
			}
		};

		const over = (e?: any) => {
			e;
			// 发送目标组件
			if (this._dragging.value) {
				this._dragging.value = false;
				this.emitter.emit('dragend', { dragObject });
			}

			handleEvents((doc) => {
				doc.removeEventListener('mousemove', move, true);
				doc.removeEventListener('mouseup', over, true);
				doc.removeEventListener('mousedown', over, true);
			});
		};

		// 用于创建拖拽定位事件
		const createLocateEvent = (e: MouseEvent | DragEvent): ILocateEvent => {
			const locateEvent: any = {
				type: 'LocateEvent',
				dragObject,
				target: e.target,
				originalEvent: e,
			};

			locateEvent.globalX = e.clientX;
			locateEvent.globalY = e.clientY;
			return locateEvent;
		};

		handleEvents((doc) => {
			// 鼠标移动
			doc.addEventListener('mousemove', move, true);
			// 鼠标松开
			doc.addEventListener('mouseup', over, true);
			// 鼠标按下
			doc.addEventListener('mousedown', over, true);
		});
	}

	private getMasterSensors() {
		return Array.from(
			new Set(
				this.designer.project.documents
					.map((doc) => doc.simulator)
					.filter(Boolean) as any
			)
		);
	}

	/**
	 * 绑定拖拽开始事件
	 * @param func
	 * @returns
	 */
	onDragstart(func: (e: ILocateEvent) => any) {
		this.emitter.on('dragstart', func);
		return () => {
			this.emitter.removeListener('dragstart', func);
		};
	}

	/**
	 * 绑定拖拽事件
	 * @param func
	 * @returns
	 */
	onDrag(func: (e: ILocateEvent) => any) {
		this.emitter.on('drag', func);
		return () => {
			this.emitter.removeListener('drag', func);
		};
	}

	/**
	 * 绑定拖拽结束事件
	 * @param func
	 * @returns
	 */
	onDragend(
		func: (x: { dragObject: IPublicModelDragObject; copy: boolean }) => any
	) {
		this.emitter.on('dragend', func);
		return () => {
			this.emitter.removeListener('dragend', func);
		};
	}
}
