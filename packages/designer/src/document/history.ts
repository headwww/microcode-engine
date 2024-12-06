import {
	IPublicModelHistory,
	IPublicTypeNodeSchema,
} from '@arvin-shu/microcode-types';
import { IDocumentModel } from './document-model';

export interface IHistory extends IPublicModelHistory {}

export class History<T = IPublicTypeNodeSchema> implements IHistory {
	constructor(
		dataFn: () => T | null,
		private redoer: (data: T) => void,
		private docment?: IDocumentModel
	) {
		dataFn;
	}
}

export class Session {
	private _data: any;

	private activeTimer: any;

	get data() {
		return this._data;
	}

	constructor(
		readonly cursor: number,
		data: any,
		private timeGap: number = 1000
	) {
		this.setTimer();
		this.log(data);
	}

	log(data: any) {
		if (!this.isActive()) {
			return;
		}
		this._data = data;
		this.setTimer();
	}

	isActive() {
		return this.activeTimer != null;
	}

	end() {
		if (this.isActive()) {
			this.clearTimer();
		}
	}

	private setTimer() {
		this.clearTimer();
		this.activeTimer = setTimeout(() => this.end(), this.timeGap);
	}

	private clearTimer() {
		if (this.activeTimer) {
			clearTimeout(this.activeTimer);
		}
		this.activeTimer = null;
	}
}
