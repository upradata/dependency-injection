import { Injector } from '../injector';
import { ClassToken, DI_PROVIDED_IN, } from '../token';

export type ProvidedInConfig = { injector: Injector; };

export const ProvidedIn = (serviceConfig: ProvidedInConfig) => (klass: ClassToken<any>) => {
    klass[ DI_PROVIDED_IN ] = serviceConfig.injector;
};
