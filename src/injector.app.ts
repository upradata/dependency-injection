import { DiInjector } from './di-injector';
import { Injector, InjectorConstructor, InjectorOptions } from './injector';

export class AppInjector {
    static root: Injector;

    static init(opts?: InjectorOptions & { injectorCtor?: InjectorConstructor; injector?: Injector; }) {
        const InjectorCtor = opts?.injectorCtor || DiInjector;
        AppInjector.root = opts?.injector || new InjectorCtor(opts as any, null);
    }
}
