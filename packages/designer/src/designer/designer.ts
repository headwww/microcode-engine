import { Dragon, IDragon } from './dragon';

export interface IDesigner {
	get dragon(): IDragon;
}
export class Designer implements IDesigner {
	dragon: IDragon;

	constructor() {
		this.dragon = new Dragon(this);
	}
}
