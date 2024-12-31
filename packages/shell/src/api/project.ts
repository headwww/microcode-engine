import { IProject as InnerProject } from '@arvin-shu/microcode-designer';
import { getLogger } from '@arvin-shu/microcode-utils';
import { globalContext } from '@arvin-shu/microcode-editor-core';
import {
	IPublicApiProject,
	IPublicTypeProjectSchema,
} from '@arvin-shu/microcode-types';
import { projectSymbol } from '../symbols';

const logger = getLogger({ level: 'warn', bizName: 'shell-project' });

const innerProjectSymbol = Symbol('innerProject');

export class Project implements IPublicApiProject {
	private readonly [innerProjectSymbol]: InnerProject;

	get [projectSymbol](): InnerProject {
		if (this.workspaceMode) {
			return this[innerProjectSymbol];
		}
		const workspace = globalContext.get('workspace');
		if (workspace.isActive) {
			if (!workspace.window?.innerProject) {
				logger.error('project api 调用时机出现问题，请检查');
				return this[innerProjectSymbol];
			}
			return workspace.window.innerProject;
		}

		return this[innerProjectSymbol];
	}

	constructor(
		project: InnerProject,
		public workspaceMode: boolean = false
	) {
		this[innerProjectSymbol] = project;
	}

	static create(project: InnerProject, workspaceMode: boolean = false) {
		return new Project(project, workspaceMode);
	}

	/**
	 * 导入 project
	 * @param schema 待导入的 project 数据
	 */
	importSchema(schema?: IPublicTypeProjectSchema): void {
		this[projectSymbol].load(schema, true);
	}
}
