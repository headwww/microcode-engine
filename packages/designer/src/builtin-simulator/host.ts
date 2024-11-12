import { Designer, IDesigner } from '../designer';
import { IProject, Project } from '../project';
import { ISimulatorHost } from '../simulator';

export class BuiltinSimulatorHost implements ISimulatorHost {
	readonly project: IProject;

	readonly designer: IDesigner;

	constructor(project: Project, designer: Designer) {
		this.project = project;
		this.designer = designer;
	}
}
