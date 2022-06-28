import { DiInjector, ProviderToken, Inject } from '../src';


describe('DiInjector', () => {

    it('should create a new instance of a single provider', () => {
        class MyService { foo = 'Hello World'; }

        const app = new DiInjector();

        expect(app.get(MyService).foo).toBe('Hello World');
    });


    it('should inject providers in the correct order', () => {
        class FooService { foo = 'FOO'; }

        class BarService { bar = 'BAR'; }

        class MyService {
            value: string;

            constructor(
                @Inject(FooService) private foo: FooService,
                @Inject(BarService) private bar: BarService
            ) {
                this.value = this.foo.foo + this.bar.bar;
            }
        }

        const app = new DiInjector();

        expect(app.get(MyService).value).toBe('FOOBAR');
    });


    it('should create a new instance of a provider with a dependency', () => {
        class BarService { foo = 'Hello World'; }

        class FooService {
            constructor(@Inject(BarService) private bar: BarService) { }

            sayHello() { return this.bar.foo; }
        }

        const app = new DiInjector();

        expect(app.get(FooService).sayHello()).toBe('Hello World');
    });


    it('should create a new instance of a provider that has a full dep tree', () => {
        class A { sayHello() { return 'a'; } }

        class B {
            constructor(@Inject(A) private a: A) { }

            sayHello() { return `${this.a.sayHello()}b`; }
        }

        class C {
            constructor(@Inject(A) private a: A, @Inject(B) private b: B) { }

            sayHello() {
                return `${this.a.sayHello()}${this.b.sayHello()}c`;
            }
        }

        class D {
            constructor(@Inject(A) private a: A, @Inject(B) private b: B, @Inject(C) private c: C) { }

            sayHello() {
                return `${this.a.sayHello()}${this.b.sayHello()}${this.c.sayHello()}d`;
            }
        }

        class E {
            constructor(@Inject(D) private d: D) { }

            sayHello() { return `${this.d.sayHello()}e`; }
        }

        const app = new DiInjector();

        expect(app.get(E).sayHello()).toBe('aabaabcde');
    });



    it('should override a provider if explicitly instructed', () => {
        class BarService { foo = 'Hello World'; }

        class FooService {
            constructor(@Inject(BarService) private bar: BarService) { }

            sayHello() { return this.bar.foo; }
        }

        expect(new DiInjector().get(FooService).sayHello()).toBe('Hello World');

        expect(
            new DiInjector({
                providers: [
                    {
                        provide: BarService,
                        useClass: class implements BarService {
                            foo = 'Goodbye World';
                        }
                    }
                ]
            })
                .get(FooService)
                .sayHello()
        ).toBe('Goodbye World');
    });


    it('immediately initialize specified providers', () => {
        const initialized: ProviderToken<any>[] = [];

        class BarService {
            constructor() {
                initialized.push(BarService);
            }
        }

        class FooService {
            constructor() {
                initialized.push(FooService);
            }
        }

        // eslint-disable-next-line no-new
        new DiInjector({ bootstrap: [ FooService, BarService ] });

        expect(initialized).toEqual([ FooService, BarService ]);
    });


    it('should return the same instance when called', () => {
        class BarService { }

        class FooService {
            constructor(@Inject(BarService) public bar: BarService) { }
        }

        const app = new DiInjector();

        expect(app.get(FooService).bar).toBe(app.get(BarService));
    });


    it('should return different instances', () => {
        class BarService { }

        class FooService {
            constructor(@Inject(BarService) public bar: BarService) { }
        }

        const app = new DiInjector();

        expect(app.createInstance(FooService)).not.toBe(app.get(FooService));
    });


    it('should return an instance from a parent DiInjector', () => {
        class BarService { }

        class FooService {
            constructor(@Inject(BarService) public bar: BarService) { }
        }

        class BazService { }

        const parent = new DiInjector();
        const child1 = new DiInjector({}, parent);
        const child2 = new DiInjector({}, child1);

        const app = new DiInjector({}, child2);

        const fooParentInstance = parent.get(FooService);
        const fooChild2Instance = child2.get(FooService);
        const bazInstance = app.get(BazService);

        expect(app.get(FooService)).toBe(fooChild2Instance);
        expect(child2.get(FooService)).toBe(fooChild2Instance);
        expect(child1.get(FooService)).toBe(fooParentInstance);

        expect(app.get(BazService)).toBe(bazInstance);
    });


    it('should use the override in scope over everything else', () => {
        class BarService { }

        class FooService {
            constructor(@Inject(BarService) public bar: BarService) { }
        }

        const parent = new DiInjector();
        const child1 = new DiInjector({}, parent);
        const child2 = new DiInjector({}, child1);

        const app = new DiInjector(
            {
                providers: [
                    {
                        provide: FooService,
                        useClass: class extends FooService { }
                    }
                ]
            },
            child2
        );

        expect(parent.get(FooService)).not.toBe(app.get(FooService));
    });


    it('should be able to use an abstract class as an injection token', () => {
        abstract class MyService {
            abstract sayHello(): string;
        }

        const app = new DiInjector({
            providers: [
                {
                    provide: MyService,
                    useClass: class implements MyService {
                        sayHello() {
                            return 'TESTING';
                        }
                    }
                }
            ]
        });

        expect(app.get(MyService).sayHello()).toBe('TESTING');
    });


    it('should return an instance when using a factory provider', () => {
        class MyService {
            constructor(private test: string) { }

            sayHello(): string {
                return `HELLO WORLD ${this.test}`;
            }
        }

        const app = new DiInjector({
            providers: [
                {
                    provide: MyService,
                    useFactory: (): MyService => new MyService('TEST')
                }
            ]
        });

        expect(app.get(MyService).sayHello()).toBe('HELLO WORLD TEST');
    });


    it('should return an instance when using a factory provider with deps', () => {
        class MyFirstService {
            sayHello() { return 'TESTING'; }
        }

        class MyService {
            constructor(private test: MyFirstService) { }

            sayHello(): string {
                return `HELLO WORLD ${this.test.sayHello()}`;
            }
        }

        const app = new DiInjector({
            providers: [
                {
                    provide: MyService,
                    useFactory: (first: MyFirstService): MyService => new MyService(first),
                    deps: [ MyFirstService ]
                }
            ]
        });

        expect(app.get(MyService).sayHello()).toBe('HELLO WORLD TESTING');
    });


    it('should return an instance when using a value provider', () => {
        class MyService {
            constructor(private test: string) { }

            sayHello(): string {
                return `HELLO WORLD ${this.test}`;
            }
        }

        const app = new DiInjector({
            providers: [
                {
                    provide: MyService,
                    useValue: { sayHello: () => 'I am a new value' } as MyService
                }
            ]
        });

        expect(app.get(MyService).sayHello()).toBe('I am a new value');
    });



    it('should work with custom decortors', () => {
        class MyFirstService {
            sayHello() { return 'TESTING'; }
        }

        const MyFirst = () => (c: any, k: string, i: number) => Inject(MyFirstService)(c, k, i);

        class MyService {
            constructor(@MyFirst() private test: MyFirstService) { }

            sayHello(): string {
                return `HELLO WORLD ${this.test.sayHello()}`;
            }
        }

        const app = new DiInjector();

        expect(app.get(MyService).sayHello()).toBe('HELLO WORLD TESTING');
    });


    it('should use the root parent if provideInRoot is true', () => {
        class BarService {
            static providedInRoot = true;
        }


        class FooService {
            static providedInRoot = true;
            constructor(@Inject(BarService) public bar: BarService) { }
        }

        const parent = new DiInjector();
        const child1 = new DiInjector({}, parent);
        const child2 = new DiInjector({}, child1);

        const app = new DiInjector({}, child2);

        expect(app.get(FooService)).toBe(parent.get(FooService));
    });


    it('should reset DI internal state', () => {
        class BarService { }

        class FooService {
            constructor(@Inject(BarService) public bar: BarService) { }
        }


        const parent = new DiInjector();
        const app = new DiInjector({}, parent);

        const foo = app.get(FooService);
        const bar = parent.get(BarService);

        expect(app.get(FooService)).toBe(foo);
        expect(parent.get(BarService)).toBe(bar);

        parent.reset();
        app.reset();

        expect(app.get(FooService)).not.toBe(foo);
        expect(parent.get(BarService)).not.toBe(bar);
    });


    it('should return same instance', () => {
        class BarService { }

        class FooService {
            constructor(@Inject(BarService) public bar: BarService) { }
        }


        const parent = new DiInjector();
        const app = new DiInjector({}, parent);

        let foo = app.get(FooService);
        let bar = parent.get(BarService);

        expect(app.get(FooService)).toBe(foo);
        expect(parent.get(BarService)).toBe(bar);

        foo = app.get(FooService);
        bar = parent.get(BarService);

        expect(app.get(FooService)).toBe(foo);
        expect(parent.get(BarService)).toBe(bar);
    });


    it('should return true if value was already injected', () => {
        class BarService { }


        class FooService {
            constructor(@Inject(BarService) public bar: BarService) { }
        }


        const parent = new DiInjector();
        const app = new DiInjector({}, parent);


        expect(app.has(FooService)).toBe(false);
        expect(app.has(BarService)).toBe(false);

        app.get(FooService);

        expect(app.has(FooService)).toBe(true);
        expect(app.has(BarService)).toBe(true);

        expect(parent.has(FooService)).toBe(false);
        expect(parent.has(BarService)).toBe(false);

        parent.get(FooService);

        expect(parent.has(FooService)).toBe(true);
        expect(parent.has(BarService)).toBe(true);
    });
});
