import { IocContext } from 'power-di';

export * from 'power-di';

/**
 * ioc容器，全局的依赖注入上下文
 */
export const globalContext = IocContext.DefaultInstance;
