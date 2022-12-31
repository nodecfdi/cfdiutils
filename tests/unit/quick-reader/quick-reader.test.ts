import { QuickReader } from '~/quick-reader/quick-reader';

describe('QuickReader', () => {
    test('minimal instance', () => {
        const tree = new QuickReader('foo');
        expect(`${tree}`).toBe('foo');
        expect(tree.toString()).toBe('foo');
        expect(tree.children()).toHaveLength(0);
    });

    test('constructor with attributes', () => {
        const attributes = {
            one: '1',
            two: '2'
        };

        const foo = new QuickReader('foo', attributes);

        expect(foo.attributes.get('one')).toBe('1');
        expect(foo.attributes.get('two')).toBe('2');
    });

    test('constructor with children', () => {
        const bar = new QuickReader('bar');
        const baz = new QuickReader('baz');
        const children = [bar, baz];
        const three = new QuickReader('foo', {}, children);

        expect(three.children()).toStrictEqual(children);
        expect(three.children.get('bar')).toStrictEqual(bar);
        expect(three.children.get('baz')).toStrictEqual(baz);
    });

    test('get not existent attribute', () => {
        const foo = new QuickReader('foo');

        expect(foo.attributes.has('bar')).toBeFalsy();
        expect(foo.attributes.get('bar')).toBe('');
        expect(foo.attributes.has('bar')).toBeFalsy();
    });

    test('access non existent property returns a new child with property name', () => {
        const foo = new QuickReader('foo');

        expect(foo.children.has('bar')).toBeFalsy();

        expect(foo.children.get('bar')).toBeInstanceOf(QuickReader);
        expect(foo.children.has('bar')).toBeFalsy();
        expect(foo.children(), 'Calling a non existent property DOES NOT append a new child').toHaveLength(0);
    });

    test('access invoke returns an array', () => {
        const foo = new QuickReader('foo');
        expect(Array.isArray(foo.children())).toBeTruthy();

        const xee = foo.children.get('bar').children.get('xee');
        expect(Array.isArray(xee.children('zee'))).toBeTruthy();
        expect(Array.isArray(xee.__invoke('zee'))).toBeTruthy();
        expect(Array.isArray(foo.children.get('bar').children.get('xee').children('zee'))).toBeTruthy();
    });

    test('access invoke returns an array of children with the argument name', () => {
        const firstBaz = new QuickReader('baz');
        const manyBaz = [firstBaz, new QuickReader('baz'), new QuickReader('baz')];
        const manyChildren = [...manyBaz, new QuickReader('xee')];

        const foo = new QuickReader('foo', {}, manyChildren);
        expect(foo.children(), 'Assert that contains 4 children').toHaveLength(4);
        expect(foo.children.get('baz'), 'Assert that the first child is the same as the property access').toEqual(
            firstBaz
        );

        const obtainedBaz = foo.children('baz');
        expect(obtainedBaz, 'Assert that all elements where retrieved').toEqual(manyBaz);
        expect(obtainedBaz, 'Assert that contains only 3 baz children').toHaveLength(3);
    });

    test('property get with different case still works', () => {
        const bar = new QuickReader('bar');
        const foo = new QuickReader('foo', {}, [bar]);

        expect(foo.children.get('bar')).toEqual(bar);
        expect(foo.children.has('bar')).toBeTruthy();

        expect(foo.children.get('Bar')).toEqual(bar);
        expect(foo.children.has('Bar')).toBeTruthy();

        expect(foo.children.get('BAR')).toEqual(bar);
        expect(foo.children.has('BAR')).toBeTruthy();

        expect(foo.children.get('bAR')).toEqual(bar);
        expect(foo.children.has('bAR')).toBeTruthy();
    });

    test('attribute get with different case still works', () => {
        const foo = new QuickReader('foo', { bar: 'México' });

        expect(foo.attributes.get('bar')).toBe('México');
        expect(foo.attributes.has('bar')).toBeTruthy();

        expect(foo.attributes.get('Bar')).toBe('México');
        expect(foo.attributes.has('Bar')).toBeTruthy();

        expect(foo.attributes.get('BAR')).toBe('México');
        expect(foo.attributes.has('BAR')).toBeTruthy();
    });

    test('invoke with different child names case', () => {
        const fooA = new QuickReader('foo');
        const fooB = new QuickReader('Foo');
        const fooC = new QuickReader('FOO');

        const root = new QuickReader('root', {}, [fooA, fooB, fooC]);

        expect(root.children('fOO')).toHaveLength(3);
    });

    test('construct throw exception on empty name', () => {
        const constructWithException = (): QuickReader => new QuickReader('');

        expect(constructWithException).toThrow(TypeError);
        expect(constructWithException).toThrow('Property name cannot be empty');
    });

    test('construct throw exception on invalid attribute name', () => {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        const constructWithException = (): QuickReader => new QuickReader('foo', { 'x': 'y', '': 'bar' });

        expect(constructWithException).toThrow(TypeError);
        expect(constructWithException).toThrow('There is an attribute with empty or non string name');
    });

    test('construct throw exception on invalid attribute value', () => {
        const fakeString = {};
        const constructWithException = (): QuickReader => new QuickReader('foo', { x: 'y', bar: fakeString });

        expect(constructWithException).toThrow(TypeError);
        expect(constructWithException).toThrow("The attribute 'bar' has a non string value");
    });

    test('construct throw exception on invalid children', () => {
        const fakeQuickReader = {} as unknown as QuickReader;
        const constructWithException = (): QuickReader =>
            new QuickReader('foo', {}, [new QuickReader('1'), fakeQuickReader]);

        expect(constructWithException).toThrow(TypeError);
        expect(constructWithException).toThrow('The child 1 is not an instance');
    });

    test('read falsy attributes', () => {
        const quickReader = new QuickReader('foo', {
            zero: '0',
            empty: '',
            space: ' ',
            control: 'x'
        });

        expect(quickReader.attributes.has('control')).toBeTruthy();
        expect(quickReader.attributes.get('control')).toBe('x');

        expect(quickReader.attributes.has('zero')).toBeTruthy();
        expect(quickReader.attributes.get('zero')).toBe('0');

        expect(quickReader.attributes.has('empty')).toBeTruthy();
        expect(quickReader.attributes.get('empty')).toBe('');

        expect(quickReader.attributes.has('space')).toBeTruthy();
        expect(quickReader.attributes.get('space')).toBe(' ');

        expect(quickReader.attributes.has('non-existent')).toBeFalsy();
        expect(quickReader.attributes.get('non-existent')).toBe('');
    });
});
