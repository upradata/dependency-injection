import { Injector } from '../injector';
import { AppInjector } from '../injector.app';
import { ClassToken, ClassProviderToken, DI_DEPS, ProviderToken, DI_CREATE_INSTANCE } from '../token';


export const Inject = (injectable: ProviderToken<any>) => {
    return (provider: ClassToken<any>, _prop: string, index: number) => {
        provider[ DI_DEPS ] = provider[ DI_DEPS ] || [];

        const deps = provider[ DI_DEPS ];
        deps[ index ] = deps[ index ] || injectable;
    };
};


export interface InjectPropOptions {
    injector?: Injector;
}


export const INJECT = Symbol('inject auto');


export const Component = (options: InjectPropOptions = {}) => {
    const NULL_ARG = Symbol('null');


    const mergeArgs = (args: any[], deps: any[]) => {
        // because klass[ DI_DEPS ] may have holes, [...klass[ DI_DEPS ]] will set 'undefined' in it
        // [,,1,] => [ <2 empty items>, 1 ]

        const depInstances = [ ...deps ].map((d, i) => ({
            index: i,
            dep: d && (i >= args.length || args[ i ] === INJECT) ? (options.injector || AppInjector.root)?.get(d) : NULL_ARG
        }));


        for (const { index, dep } of depInstances)
            args[ index ] = dep !== NULL_ARG ? dep : args[ index ];


        return args;
    };


    return (klass: ClassProviderToken<any>): ClassProviderToken<any> => {

        const isFromDI = (C: ClassProviderToken<any>) => C[ DI_CREATE_INSTANCE ];

        return class C extends klass {
            constructor(...args: any[]) {
                super(...(isFromDI(C) ? args : mergeArgs(args, klass[ DI_DEPS ] || [])));
            }
        };
    };
};



/*
export interface InjectPropOptions {
    injector?: Injector;
}


export function InjectProp<T>(provider: ProviderToken<T>, options: InjectPropOptions = {}) {
    if (provider === undefined) {
        throw new Error(`The dependence provider injected is "undefined". It can be caused by a [Circular] reference in your import.`);
    }

    // const diInject = Inject(provider);

    return (klass: ClassToken<any>, _propertyKey: string | symbol, parameterIndex: number) => {
        // propertyKey is always undefined because it is not a parameter decorator
        const constructorArgs: string = klass.toString().match(/constructor[^(]*\(([^)]*)\)/)[ 1 ];

        if (!constructorArgs || parameterIndex >= constructorArgs.split(/\W+/).length) {
            const providerName: string = (provider as any).name || String(provider);
            throw new Error(`Argument ${parameterIndex} in ${klass.name}.constructor is missing to inject ${providerName}`);
        }

        const argumentName = constructorArgs.split(/\W+/)[ parameterIndex ];

        // call di @Inject (it is defining the provider dependencies if classPrototype will be instantiated)
        // diInject(klass, argumentName, parameterIndex);

        // Injector.root will be instanciated after, so we can call it later
        debugger;
        Object.defineProperty(klass.prototype, argumentName, {
            get: () => (options.injector || AppInjector.root).get(provider),
            // writable: false,
            configurable: false,
            enumerable: true
        });
    };
}
 */
