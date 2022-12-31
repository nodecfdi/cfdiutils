import { install } from '@nodecfdi/cfdiutils-common';
import { DOMImplementation, DOMParser, XMLSerializer } from '@xmldom/xmldom';
import { QuickReader } from '~/quick-reader/quick-reader';
import { QuickReaderImporter } from '~/quick-reader/quick-reader-importer';

describe('QuickReaderImporter', () => {
    beforeAll(() => {
        install(new DOMParser(), new XMLSerializer(), new DOMImplementation());
    });

    test('importer import empty node', () => {
        const document = new DOMParser().parseFromString('<root/>', 'text/xml');

        const importer = new QuickReaderImporter();
        const root = importer.importDocument(document);

        expect(root).toBeInstanceOf(QuickReader);
        expect(root.children()).toHaveLength(0);
    });

    test('importer import empty node with namespaces', () => {
        const document = new DOMParser().parseFromString('<my:root xmlns:my="http://my.net/my" />', 'text/xml');

        const importer = new QuickReaderImporter();
        const root = importer.importDocument(document);

        expect(root).toBeInstanceOf(QuickReader);
        expect(root.children()).toHaveLength(0);
    });

    test('importer import with attributes', () => {
        const document = new DOMParser().parseFromString('<root id="123" score="MEX 1 - 0 GER"/>', 'text/xml');

        const importer = new QuickReaderImporter();
        const root = importer.importDocument(document);

        expect(root).toBeInstanceOf(QuickReader);
        expect(root.children()).toHaveLength(0);
        expect(root.attributes.get('id')).toBe('123');
        expect(root.attributes.get('score')).toBe('MEX 1 - 0 GER');
    });

    test('importer import with children', () => {
        const document = new DOMParser().parseFromString('<root><foo /><bar /></root>', 'text/xml');

        const importer = new QuickReaderImporter();
        const root = importer.importDocument(document);

        expect(root).toBeInstanceOf(QuickReader);
        expect(root.children()).toHaveLength(2);
        expect(`${root.children.get('foo')}`).toBe('foo');
        expect(`${root.children.get('bar')}`).toBe('bar');
        expect(root.children()).toHaveLength(2);
    });

    test('importer import with grand children', () => {
        const document = new DOMParser().parseFromString(
            '<root><foo><l1><l2 id="xee"></l2></l1></foo><bar /></root>',
            'text/xml'
        );

        const importer = new QuickReaderImporter();
        const root = importer.importDocument(document);

        expect(root).toBeInstanceOf(QuickReader);
        expect(root.children.get('foo').children.get('l1').children.get('l2').attributes.get('id')).toBe('xee');
    });

    test('import xml with different nodes', () => {
        const document = new DOMParser().parseFromString(
            ['<root>', '   <!-- comment -->', '   <foo />', '</root>'].join('\n'),
            'text/xml'
        );

        const importer = new QuickReaderImporter();
        const root = importer.importDocument(document);
        expect(root.children.has('foo')).toBeTruthy();
        expect(root.children()).toHaveLength(1);
        expect(root.children.get('foo').children()).toHaveLength(0);
    });

    test('import children with same name', () => {
        const document = new DOMParser().parseFromString(
            [
                '<root>',
                '   <foo id="1"/>',
                '   <Foo id="2"/>',
                '   <FOO id="3"/>',
                '   <bar />',
                '   <bar />',
                '   <baz />',
                '</root>'
            ].join('\n'),
            'text/xml'
        );

        const importer = new QuickReaderImporter();
        const root = importer.importDocument(document);

        expect(root.children()).toHaveLength(6);
        expect(root.children('foo')).toHaveLength(3);
        expect(root.children('bar')).toHaveLength(2);
        expect(root.children('baz')).toHaveLength(1);
        expect(root.children('xee')).toHaveLength(0);
    });

    test('import with namespaces are excluded', () => {
        const document = new DOMParser().parseFromString(
            [
                '<my:root xmlns:my="http://example.com/my" xmlns:other="http://example.com/other">',
                '   <my:foo id="1"/>',
                '   <my:Foo id="2"/>',
                '   <my:FOO id="3"/>',
                '   <other:bar />',
                '   <other:bar />',
                '   <other:baz />',
                '</my:root>'
            ].join('\n'),
            'text/xml'
        );

        const importer = new QuickReaderImporter();
        const root = importer.importDocument(document);

        expect(root.children()).toHaveLength(6);
        expect(root.children('foo')).toHaveLength(3);
        expect(root.children('bar')).toHaveLength(2);
        expect(root.children('baz')).toHaveLength(1);
        expect(root.children('xee')).toHaveLength(0);
    });
});
