import { ClassToken, DI_PROVIDED_IN_ROOT } from '../token';

export const RootService = () => (klass: ClassToken<any>) => {
    klass[ DI_PROVIDED_IN_ROOT ] = true;
};
