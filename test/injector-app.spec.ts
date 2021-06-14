
import { AppInjector, DiInjector } from '../src';




describe('AppInjector', () => {

    it('should init', () => {
        class MyService { foo = 'Hello World'; }

        AppInjector.init();

        expect(AppInjector.root.get(MyService).foo).toBe('Hello World');
    });


    it('should use provider injector', () => {
        class MyService { foo = 'Hello World'; }

        const app = new DiInjector();
        AppInjector.init({ injector: app });

        expect(AppInjector.root.get(MyService)).toBe(app.get(MyService));
    });
});
