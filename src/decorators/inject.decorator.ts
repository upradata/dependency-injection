import { DiInjector } from '../di-injector';
import { Injector, InjectorConstructor, InjectorOptions } from '../injector';
import { ClassToken, DI_DEPS, ProviderToken } from '../token';


export const Inject = (injectable: ProviderToken<any>) => {
    return (provider: ClassToken<any>, _prop: string, index: number) => {
        provider[ DI_DEPS ] = provider[ DI_DEPS ] || [];

        const deps = provider[ DI_DEPS ];
        deps[ index ] = deps[ index ] || injectable;
    };
};


export class AppInjector {
    static root: Injector;

    static init(opts?: InjectorOptions & { injector?: InjectorConstructor; }, parent?: Injector) {
        const InjectorCtor = opts?.injector || DiInjector;
        AppInjector.root = new InjectorCtor(opts as any, parent);
    }
}


/*
export interface InjectPropOptions {
    injector?: Injector;
}


export function InjectProp<T>(provider: ProviderToken<T>, options: InjectPropOptions = {}) {
    if (provider === undefined) {
        throw new Error(`The dependence provider injected is "undefined". It can be caused by a [Circular] reference in your import.`);
    }

    const diInject = Inject(provider);

    return (klass: ClassToken<any>, _propertyKey: string | symbol, parameterIndex: number) => {
        // propertyKey is always undefined because it is not a parameter decorator
        const constructorArgs: string = klass.toString().match(/constructor[^(]*\(([^)]*)\)/)[ 1 ];

        if (!constructorArgs || parameterIndex >= constructorArgs.split(/\W+/).length) {
            const providerName: string = (provider as any).name || String(provider);
            throw new Error(`Argument ${parameterIndex} in ${klass.name}.constructor is missing to inject ${providerName}`);
        }

        const argumentName = constructorArgs.split(/\W+/)[ parameterIndex ];

        // call di @Inject (it is defining the provider dependencies if classPrototype will be instantiated)
        diInject(klass, argumentName, parameterIndex);

        const Ctor = klass as Constructor<T>;

        // eslint-disable-next-line func-names
        const NewCtor = function (...args: any[]) {
            const instance = new Ctor(...args);
            instance[ argumentName ] = (options.injector || AppInjector.root).get(provider);
        };

        // NewCtor.name = klass.name;
        klass.prototype.constructor = { ...Ctor, ...NewCtor }; // copy statics

        // Injector.app will be instanciated after, so we can call it later
        // Object.defineProperty(klass, argumentName, {
        //     get: () => (options.injector || AppInjector.root).get(provider),
        //     // writable: false,
        //     configurable: false,
        //     enumerable: true
        // });
    };
}
 */
