import {
	IPublicEnumDragObjectType,
	IPublicModelDragObject,
	IPublicModelDragon,
	IPublicModelLocateEvent,
	IPublicModelNode,
	IPublicModelSensor,
	IPublicTypeDragNodeDataObject,
} from '@arvin-shu/microcode-types';
import {
	createModuleEventBus,
	IEventBus,
} from '@arvin-shu/microcode-editor-core';
import { ref } from 'vue';
import { IDesigner } from './designer';
import { makeEventsHandler } from '../utils';
import { isShaken } from './utils';
import { ISimulatorHost, isSimulatorHost } from '../simulator';
import { Node } from '../document';

export function isInvalidPoint(e: any, last: any): boolean {
	return (
		e.clientX === 0 &&
		e.clientY === 0 &&
		last &&
		(Math.abs(last.clientX - e.clientX) > 5 ||
			Math.abs(last.clientY - e.clientY) > 5)
	);
}

export function isSameAs(
	e1: MouseEvent | DragEvent,
	e2: MouseEvent | DragEvent
): boolean {
	return e1.clientY === e2.clientY && e1.clientX === e2.clientX;
}

export interface ILocateEvent extends IPublicModelLocateEvent {
	readonly type: 'LocateEvent';

	sensor?: IPublicModelSensor;
}

export interface IDragon extends IPublicModelDragon<ILocateEvent> {
	emitter: IEventBus;
}

function isDragEvent(e: any): e is DragEvent {
	return e?.type?.startsWith('drag');
}

export function setShaken(e: any) {
	e.shaken = true;
}

// 判断是否为拖拽节点对象
export function isDragNodeObject(
	obj: any
): obj is IPublicTypeDragNodeDataObject {
	return obj && obj.type === IPublicEnumDragObjectType.Node;
}

function getSourceSensor(
	dragObject: IPublicModelDragObject
): ISimulatorHost | null {
	if (!isDragNodeObject(dragObject)) {
		return null;
	}
	return (dragObject.nodes?.[0]?.document as any).simulator || null;
}

export class Dragon implements IDragon {
	private sensors: IPublicModelSensor[] = [];

	emitter: IEventBus = createModuleEventBus('Dragon');

	private _dragging = ref(false);

	private _activeSensor = ref<IPublicModelSensor | undefined>();

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
		const { designer } = this;
		const masterSensors = this.getMasterSensors();

		const handleEvents = makeEventsHandler(boostEvent, masterSensors);

		// 是否是新的node对象而不是模拟器中已经有的node对象
		const newBie = !isDragNodeObject(dragObject);
		// TODO是否强制复制
		const hasSlotNode = dragObject.nodes?.some(
			(node: Node | IPublicModelNode | null) =>
				typeof node?.isSlot === 'function' ? node.isSlot() : node?.isSlot
		);
		const forceCopyState = isDragNodeObject(dragObject) && hasSlotNode;

		const isBoostFromDragAPI = isDragEvent(boostEvent);

		let lastSensor: IPublicModelSensor | undefined;

		this._dragging.value = false;

		const checkesc = (e: KeyboardEvent) => {
			// ESC cancel drag
			if (e.keyCode === 27) {
				designer.clearLocation();
				over();
			}
		};

		let copy = false;
		const checkcopy = (e: any) => {
			if (isDragEvent(e) && e.dataTransfer) {
				if (newBie || forceCopyState) {
					e.dataTransfer.dropEffect = 'copy';
				}
				return;
			}
			if (newBie) {
				return;
			}

			if (e.altKey || e.ctrlKey) {
				copy = true;
				this.setCopyState(true);
				if (isDragEvent(e) && e.dataTransfer) {
					e.dataTransfer.dropEffect = 'copy';
				}
			} else {
				copy = false;
				if (!forceCopyState) {
					this.setCopyState(false);
					if (isDragEvent(e) && e.dataTransfer) {
						e.dataTransfer.dropEffect = 'move';
					}
				}
			}
		};

		let lastArrive: any;

		const drag = (e: MouseEvent | DragEvent) => {
			checkcopy(e);

			if (isInvalidPoint(e, lastArrive)) return;

			if (lastArrive && isSameAs(e, lastArrive)) {
				lastArrive = e;
				return;
			}
			lastArrive = e;

			const locateEvent = createLocateEvent(e);
			const sensor = chooseSensor(locateEvent);

			// TODO 磁贴设计，未设计

			if (sensor) {
				sensor.fixEvent(locateEvent);
				sensor?.locate(locateEvent);
			} else {
				// 清除插入的位置
				designer.clearLocation();
			}

			this.emitter.emit('drag', locateEvent);
		};

		const dragstart = () => {
			this._dragging.value = true;
			setShaken(boostEvent);
			const locateEvent = createLocateEvent(boostEvent);
			if (newBie || forceCopyState) {
				this.setCopyState(true);
			} else {
				chooseSensor(locateEvent);
			}
			this.setDraggingState(true);

			if (!isBoostFromDragAPI) {
				handleEvents((doc) => {
					doc.addEventListener('keydown', checkesc, false);
				});
			}

			this.emitter.emit('dragstart', locateEvent);
		};

		const move = (e: MouseEvent | DragEvent) => {
			// 检查是否为拖拽API事件
			if (isBoostFromDragAPI) {
				// 阻止默认行为
				e.preventDefault();
			}
			if (this._dragging.value) {
				drag(e);
				return;
			}

			if (isShaken(boostEvent, e)) {
				dragstart();
				drag(e);
			}
		};

		let didDrop = true;
		const drop = (e: DragEvent) => {
			e.preventDefault();
			e.stopPropagation();
			didDrop = true;
		};

		const over = (e?: any) => {
			// TODO 处理磁铁情况

			if (e && isDragEvent(e)) {
				e.preventDefault();
			}
			if (lastSensor) {
				lastSensor.deactiveSensor();
			}
			if (isBoostFromDragAPI) {
				if (!didDrop) {
					designer.clearLocation();
				}
			} else {
				this.setNativeSelection(true);
			}
			this.clearState();

			let exception;
			if (this._dragging) {
				this._dragging.value = false;
				try {
					this.emitter.emit('dragend', { dragObject, copy });
				} catch (ex) {
					exception = ex;
				}
			}
			designer.clearLocation();
			handleEvents((doc) => {
				/* istanbul ignore next */
				if (isBoostFromDragAPI) {
					doc.removeEventListener('dragover', move, true);
					doc.removeEventListener('dragend', over, true);
					doc.removeEventListener('drop', drop, true);
				} else {
					doc.removeEventListener('mousemove', move, true);
					doc.removeEventListener('mouseup', over, true);
				}
				doc.removeEventListener('mousedown', over, true);
				doc.removeEventListener('keydown', checkesc, false);
				doc.removeEventListener('keydown', checkcopy, false);
				doc.removeEventListener('keyup', checkcopy, false);
			});
			if (exception) {
				throw exception;
			}
		};

		// 用于创建拖拽定位事件
		const createLocateEvent = (e: MouseEvent | DragEvent): ILocateEvent => {
			const evt: any = {
				type: 'LocateEvent',
				dragObject,
				target: e.target,
				originalEvent: e,
			};

			const sourceDocument = e.view?.document;

			if (!sourceDocument || sourceDocument === document) {
				evt.globalX = e.clientX;
				evt.globalY = e.clientY;
			}
			let srcSim: ISimulatorHost | undefined;
			const lastSim =
				lastSensor && isSimulatorHost(lastSensor) ? lastSensor : null;
			if (lastSim && lastSim.contentDocument === sourceDocument) {
				srcSim = lastSim;
			} else {
				srcSim = masterSensors.find(
					(sim) => sim.contentDocument === sourceDocument
				);
				if (!srcSim && lastSim) {
					srcSim = lastSim;
				}
			}

			if (srcSim) {
				const g = srcSim.viewport.toGlobalPoint(e);
				evt.globalX = g.clientX;
				evt.globalY = g.clientY;
				evt.canvasX = e.clientX;
				evt.canvasY = e.clientY;
				evt.sensor = srcSim;
			} else {
				evt.globalX = e.clientX;
				evt.globalY = e.clientY;
			}
			return evt;
		};

		const sourceSensor = getSourceSensor(dragObject);

		// 选择传感器
		const chooseSensor = (e: ILocateEvent) => {
			const sensors: IPublicModelSensor[] = this.sensors.concat(
				masterSensors as IPublicModelSensor[]
			);
			let sensor =
				e.sensor && e.sensor.isEnter(e)
					? e.sensor
					: sensors.find((s) => s.sensorAvailable && s.isEnter(e));
			if (!sensor) {
				if (lastSensor) {
					sensor = lastSensor;
				} else if (e.sensor) {
					sensor = e.sensor;
				} else if (sourceSensor) {
					sensor = sourceSensor;
				}
			}

			if (sensor !== lastSensor) {
				if (lastSensor) {
					lastSensor.deactiveSensor();
				}
				lastSensor = sensor;
			}

			if (sensor) {
				e.sensor = sensor;
				sensor.fixEvent(e);
			}
			this._activeSensor.value = sensor;
			return sensor;
		};

		handleEvents((doc) => {
			if (isBoostFromDragAPI) {
				doc.addEventListener('dragover', move, true);
				didDrop = false;
				doc.addEventListener('drop', drop, true);
				doc.addEventListener('dragend', over, true);
			} else {
				// 鼠标移动
				doc.addEventListener('mousemove', move, true);
				// 鼠标松开
				doc.addEventListener('mouseup', over, true);
			}

			// 鼠标按下
			doc.addEventListener('mousedown', over, true);
		});

		if (!newBie && !isBoostFromDragAPI) {
			handleEvents((doc) => {
				doc.addEventListener('keydown', checkcopy, false);
				doc.addEventListener('keyup', checkcopy, false);
			});
		}
	}

	private setDraggingState(state: boolean) {
		state;
	}

	private getMasterSensors(): ISimulatorHost[] {
		return Array.from(
			new Set(
				this.designer.project.documents
					.map((doc) => {
						if (doc.active && doc.simulator?.sensorAvailable) {
							return doc.simulator;
						}
						return null;
					})
					.filter(Boolean) as any
			)
		);
	}

	private setNativeSelection(enableFlag: boolean) {
		enableFlag;
	}

	private setCopyState(state: boolean) {
		state;
	}

	private clearState() {
		// TODO 清除状态
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
