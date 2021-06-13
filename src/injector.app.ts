import { DiInjector } from './di-injector';
import { Injector, InjectorConstructor, InjectorOptions } from './injector';

export class AppInjector {
    static root: Injector;

    static init(opts?: InjectorOptions & { injector?: InjectorConstructor; }, parent?: Injector) {
        const InjectorCtor = opts?.injector || DiInjector;
        AppInjector.root = new InjectorCtor(opts as any, parent);
    }
}
