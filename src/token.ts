import { Injector } from './injector';


export const DI_DEPS = Symbol('di dependencies');
export const DI_PROVIDED_IN_ROOT = Symbol('is root service?');
export const DI_PROVIDED_IN = Symbol('provided in a specific injector');
export const DI_CREATE_INSTANCE = Symbol('instance created by DI');
export const DI_DECORATED_MEMBERS = Symbol('decorated members by DI');


export type ClassProviderTokenBase = {
    providedInRoot?: boolean;
    [ DI_PROVIDED_IN_ROOT ]?: boolean;
    [ DI_PROVIDED_IN ]?: Injector;
    [ DI_DEPS ]?: ProviderToken<any>[]; // dependencies
};

export type Constructor<T = any> = new (...args: any[]) => T;

export type ClassProviderToken<T> = Constructor<T> & ClassProviderTokenBase;
export type AbstractClassProviderToken<T> = Function & { prototype: T; } & ClassProviderTokenBase;

export type ClassToken<T> = ClassProviderToken<T> | AbstractClassProviderToken<T>;
export type IdToken<T> = T extends Constructor<any> ? never : T;
export type ProviderToken<T> = ClassToken<T> | IdToken<T>;


export const isClassToken = <T = any>(token: ProviderToken<T>): token is ClassToken<T> => 'constructor' in token;
