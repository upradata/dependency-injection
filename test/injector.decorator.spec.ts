import { DiInjector, Inject, RootService, ProvidedIn, Component, AppInjector, INJECT, InjectProp } from '../src';


describe('Injector Decorator', () => {


    it('should use the root parent if RootService decorator is used', () => {
        @RootService()
        class BarService { }

        @RootService()
        class FooService {
            constructor(@Inject(BarService) public bar: BarService) { }
        }

        const parent = new DiInjector();
        const child1 = new DiInjector({}, parent);
        const child2 = new DiInjector({}, child1);

        const app = new DiInjector({}, child2);

        expect(app.get(FooService)).toBe(parent.get(FooService));
    });


    it('should use the the provided Injector if ProvidedIn decorator is used', () => {
        const parent = new DiInjector();
        const child1 = new DiInjector({}, parent);
        const child2 = new DiInjector({}, child1);

        const app = new DiInjector({}, child2);


        @ProvidedIn({ injector: child1 })
        class BarService { }


        @ProvidedIn({ injector: child2 })
        class FooService {
            constructor(@Inject(BarService) public bar: BarService) { }
        }



        expect(app.get(FooService)).toBe(child2.get(FooService));
        expect(parent.get(FooService)).toBe(child2.get(FooService));

        expect(app.get(FooService).bar).toBe(child1.get(BarService));
        expect(parent.get(FooService).bar).toBe(child1.get(BarService));

        expect(app.get(BarService)).toBe(child1.get(BarService));
        expect(parent.get(BarService)).toBe(child1.get(BarService));
    });


    it('should inject the class with @Inject manually and automatically with the presence of @Component', () => {
        const injector = new DiInjector();

        class BarService { }


        @Component({ injector })
        class FooService {
            constructor(@Inject(BarService) public bar?: BarService) { }
        }


        AppInjector.root = injector;

        @Component()
        class FooService2 {
            constructor(@Inject(BarService) public bar?: BarService) { }
        }



        expect(injector.get(FooService).bar).toBe(injector.get(BarService));
        expect(injector.get(FooService2).bar).toBe(injector.get(BarService));

        expect(new FooService().bar).toBe(injector.get(BarService));
        expect(new FooService2().bar).toBe(injector.get(BarService));

        AppInjector.root = undefined;
    });


    it('should inject the class with @Inject manually and automatically with the presence of @Component', () => {
        const injector = new DiInjector();

        class BarService { }


        @Component({ injector })
        class FooService {
            constructor(public a = 1, public b = 2, @Inject(BarService) public bar?: BarService, public c = 3) { }
        }


        expect(injector.get(FooService).bar).toBe(injector.get(BarService));
        expect(injector.get(FooService).a).toBe(1);
        expect(injector.get(FooService).b).toBe(2);
        expect(injector.get(FooService).c).toBe(3);

        expect(new FooService().bar).toBe(injector.get(BarService));
        expect(new FooService().a).toBe(1);
        expect(new FooService().b).toBe(2);
        expect(new FooService().c).toBe(3);

        expect(new FooService(11, 22).bar).toBe(injector.get(BarService));
        expect(new FooService(11, 22).a).toBe(11);
        expect(new FooService(11, 22).b).toBe(22);
        expect(new FooService(11, 22).c).toBe(3);

        expect(new FooService(11, 22, null, 33).bar).toBe(null);
        expect(new FooService(11, 22, null, 33).a).toBe(11);
        expect(new FooService(11, 22, null, 33).b).toBe(22);
        expect(new FooService(11, 22, null, 33).c).toBe(33);

        expect(new FooService(11, 22, 'anything', 33).bar).toBe('anything');
        expect(new FooService(11, 22, INJECT, 33).bar).toBe(injector.get(BarService));
    });


    it('should inject the class in the member with @InjectProp', () => {
        const injector = new DiInjector();
        class BarService { }


        @Component({ injector })
        class FooService {
            @InjectProp(BarService, { injector }) public bar?: BarService;
            constructor(public a = 1) { }
        }

        const foo = injector.get(FooService);
        expect(foo.bar).toBe(injector.get(BarService));
        expect(foo.a).toBe(1);
    });
});
