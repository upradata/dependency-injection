import { ProviderToken, ClassProviderToken } from './token';


export interface ClassProvider<T> {
    provide: ProviderToken<T>;
    useClass: ClassProviderToken<T>;
    provideInRoot?: boolean;
}


export interface FactoryProvider<T> {
    provide: ProviderToken<T>;
    useFactory: (...args: any[]) => T;
    deps?: ProviderToken<any>[];
    provideInRoot?: boolean;
}


export interface ValueProvider<T> {
    provide: ProviderToken<T>;
    useValue: T;
    provideInRoot?: boolean;
}


export type Provider<T> = ValueProvider<T> | ClassProvider<T> | FactoryProvider<T>;

export const isValueProvider = <T = any>(p: Provider<T>): p is ValueProvider<T> => 'useValue' in p;
export const isFactoryProvider = <T = any>(p: Provider<T>): p is FactoryProvider<T> => 'useFactory' in p;
export const isClassProvider = <T = any>(p: Provider<T>): p is ClassProvider<T> => 'useClass' in p;
