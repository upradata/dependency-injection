
import { Injector, InjectorOptions } from './injector';
import {
    FactoryProvider,
    isClassProvider,
    isFactoryProvider,
    isValueProvider,
    Provider
} from './provider';
import {
    ClassProviderToken,
    ClassToken,
    DI_CREATE_INSTANCE,
    DI_DEPS,
    DI_PROVIDED_IN,
    DI_PROVIDED_IN_ROOT,
    IdToken,
    isClassToken,
    ProviderToken
} from './token';



/**
 * Create an instance of a Dependency injector.
 * Can be used to create a singleton of any class that is property annotated with dependencies.
 *
 * @param opts configuration options for the current instance of Injector
 * @param parent a parent instance of Injector
 */
export class DiInjector extends Injector {
    private classProviderMap: WeakMap<ClassToken<any>, any>;
    private idProviderMap: Map<IdToken<any>, any>;

    constructor(opts?: InjectorOptions, parent?: Injector) {
        super(opts, parent);

        this.init();

        if (this.opts.bootstrap)
            this.opts.bootstrap.forEach(provider => this.get(provider));
    }

    private init() {
        this.classProviderMap = new WeakMap();
        this.idProviderMap = new Map();
    }

    reset() {
        this.init();
    }

    root(): Injector {
        const root = (current: Injector) => current.parent ? root(current.parent) : current;
        return root(this);
    }


    /**
     * recursively check if a singleton instance is available for a provider
     */
    has(token: ProviderToken<any>): boolean {
        return !!this.whoHas(token);
    }

    whoHas(token: ProviderToken<any>): Injector {
        const hasToken = this.classProviderMap.has(token) || this.idProviderMap.has(token);

        return hasToken ? this : this.parent?.whoHas(token) ?? null;
    }

    getNewValue<T>(token: ProviderToken<T>): T {
        const provider = this.getProviderFromOptions(token);

        // if an override is available for this Injector use that
        if (provider)
            return this.createFromOverride(provider);

        if (isClassToken(token))
            return this.createInstance(token as ClassProviderToken<any>);

        return null;
    }


    private set<T>(token: ProviderToken<T>, value: any): void {
        if (isClassToken(token)) {
            this.classProviderMap.set(token, value);
        } else {
            this.idProviderMap.set(token, value);
        }
    }

    getStrcit<T>(token: ProviderToken<T>): T {
        if (isClassToken(token) && this.classProviderMap.has(token)) {
            return this.classProviderMap.get(token);
        }

        if (this.idProviderMap.has(token)) {
            // if provider has already been created in this scope return it
            return this.idProviderMap.get(token);
        }

        const value = this.getNewValue(token);

        if (value) {
            this.set(token, value);
            return value;
        }

        return null;
        // throw new Error(`The token "${token}" is not a class and does not have any provider defined`);
    }


    /**
     * fetches a singleton instance of a provider
     */
    get<T>(token: ProviderToken<T>): T {

        if (isClassToken(token) && token[ DI_PROVIDED_IN ] && token[ DI_PROVIDED_IN ] !== this) {
            return token[ DI_PROVIDED_IN ].getStrcit(token);
        }

        if (isClassToken(token) && (token[ DI_PROVIDED_IN_ROOT ] || token.providedInRoot) && this.parent) {
            return this.root().getStrcit(token);
        }


        if (this.getProviderFromOptions(token))
            return this.getStrcit(token);

        const injector = this.whoHas(token);

        if (injector)
            return injector.getStrcit(token);

        return this.getStrcit(token);
    }


    createInstance<T>(P: ClassProviderToken<T>): T {
        P[ DI_CREATE_INSTANCE ] = true;

        const instance = P[ DI_DEPS ] ? new P(...P[ DI_DEPS ].map(dep => this.get(dep))) : new P();

        delete P[ DI_CREATE_INSTANCE ];

        return instance;
    }

    private createFromOverride<T>(provider: Provider<T>): T {
        if (isValueProvider(provider))
            return provider.useValue;

        if (isClassProvider(provider))
            return this.createInstance(provider.useClass);

        if (isFactoryProvider(provider))
            return this.createFromFactory(provider);

        throw new Error(`Provider type must be a value, class or factory.`);
    }

    private createFromFactory<T>(provider: FactoryProvider<T>) {
        const deps = provider.deps ? provider.deps.map(dep => this.get(dep)) : [];

        return provider.useFactory(...deps);
    }

    private getProviderFromOptions(token: ProviderToken<any>): Provider<any> | null {
        return this.opts.providers?.find(provider => provider.provide === token) || null;
    }
}
