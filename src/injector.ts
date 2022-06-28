import { Provider } from './provider';
import { ClassProviderToken, ProviderToken } from './token';


export interface InjectorOptions {
    providers?: Provider<any>[];
    bootstrap?: ProviderToken<any>[];
}

export type InjectorConstructor = new (opts?: InjectorOptions, parent?: Injector) => Injector;



export abstract class Injector {
    constructor(protected opts: InjectorOptions = {}, public parent?: Injector) { }

    abstract has(token: ProviderToken<any>): boolean;
    abstract whoHas(token: ProviderToken<any>): Injector;
    abstract getStrict<T>(token: ProviderToken<T>): T;
    abstract get<T>(token: ProviderToken<T>, recursive?: boolean): T;
    abstract createInstance<T>(P: ClassProviderToken<T>): T;
    abstract reset(): void;
    abstract root(current: Injector): Injector;
}
