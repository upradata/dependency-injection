
import { Injector, InjectorOptions } from './injector';
import { Provider, FactoryProvider, isValueProvider, isClassProvider, isFactoryProvider, } from './provider';
import { ProviderToken, ClassToken, IdToken, isClassToken, ClassProviderToken, DI_DEPS, DI_PROVIDED_IN_ROOT, DI_PROVIDED_IN } from './token';

interface SuccessValue<T> {
    value: T;
    success: boolean;
}

const successify = <T>(v: T) => ({ value: v, success: !!v });


/**
 * Create an instance of a Dependency injector.
 * Can be used to create a singleton of any class that is property annotated with dependencies.
 *
 * @param opts configuration options for the current instance of Injector
 * @param parent a parent instance of Injector
 */
export class DiInjector extends Injector {
    private classProviderMap = new WeakMap<ClassToken<any>, any>();
    private idProviderMap = new Map<IdToken<any>, any>();

    constructor(opts?: InjectorOptions, parent?: DiInjector) {
        super(opts, parent);

        if (this.opts.bootstrap)
            this.opts.bootstrap.forEach(provider => this.get(provider));
    }

    /**
     * recursively check if a singleton instance is available for a provider
     */
    has(token: ProviderToken<any>): boolean {
        return !!this.get(token);
    }

    resolveProvider<T>(token: ProviderToken<T>, recursive = true): SuccessValue<T> {

        if (isClassToken(token) && (token[ DI_PROVIDED_IN_ROOT ] || token.providedInRoot) && this.parent) {
            const rootInjector = (current: Injector): Injector => current.parent ? rootInjector(current.parent) : current;
            const root = rootInjector(this);

            return successify(root.get(token));
        }

        const provider = this.getProviderFromOptions(token);

        if (provider) {
            // if an override is available for this Injector use that
            return successify(this.createFromOverride(provider));
        }


        if (recursive) {
            const resolved = successify(this.parent?.get<T>(token));

            if (resolved.success)
                return resolved;
        }

        // only a class can be instatiated from the token
        /*  if (!isClassProviderToken(token))
             return { value: null, success: false }; */

        // if nothing else found assume provider is a class provider
        return successify(this.createInstance(token as ClassProviderToken<any>));
    }


    getStrcit<T>(token: ProviderToken<T>): T {
        if (isClassToken(token) && this.classProviderMap.has(token)) {
            return this.classProviderMap.get(token);
        }

        if (this.idProviderMap.has(token)) {
            // if provider has already been created in this scope return it
            return this.idProviderMap.get(token);
        }

        return null;
    }

    private set<T>(token: ProviderToken<T>, value: any): void {
        if (isClassToken(token)) {
            this.classProviderMap.set(token, value);
        } else {
            this.idProviderMap.set(token, value);
        }
    }

    /**
     * fetches a singleton instance of a provider
     */
    get<T>(token: ProviderToken<T>, recursive = true): T {

        if (isClassToken(token) && token[ DI_PROVIDED_IN ] && token[ DI_PROVIDED_IN ] !== this && recursive) {
            return token[ DI_PROVIDED_IN ].get(token, false);
        }

        const v = successify(this.getStrcit(token));

        if (v.success)
            return v.value;

        const { success, value } = this.resolveProvider<T>(token, recursive);

        if (success) {
            this.set(token, value);
            return value;
        }

        throw new Error(`The token "${token}" is not a class and does not have any provider defined`);
    }

    createInstance<T>(P: ClassProviderToken<T>): T {
        return P[ DI_DEPS ] ? new P(...P[ DI_DEPS ].map(dep => this.get(dep))) : new P();
    }

    private createFromOverride<T>(provider: Provider<T>): T {
        if (isValueProvider(provider))
            return provider.useValue;

        if (isClassProvider(provider))
            return this.createInstance(provider.useClass);

        if (isFactoryProvider(provider))
            return this.createFromFactory(provider);

        throw new Error(`Provider must use one a value, class or factory provider.`);
    }

    private createFromFactory<T>(provider: FactoryProvider<T>) {
        const deps = provider.deps ? provider.deps.map(dep => this.get(dep)) : [];

        return provider.useFactory(...deps);
    }

    private getProviderFromOptions(token: ProviderToken<any>): Provider<any> | null {
        return this.opts.providers?.find(provider => provider.provide === token) || null;
    }
}
