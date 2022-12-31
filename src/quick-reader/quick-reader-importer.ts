import { Xml } from '@nodecfdi/cfdiutils-common';
import { QuickReader } from './quick-reader';

export class QuickReaderImporter {
    public importDocument(document: Document): QuickReader {
        return this.importNode(Xml.documentElement(document));
    }

    public importNode(node: Element): QuickReader {
        return this.createQuickReader(
            this.extractNameFromNode(node),
            this.extractAttributes(node),
            this.extractChildren(node)
        );
    }

    protected extractNameFromNode(node: Element): string {
        // The property localName has the tagName without namespace prefix
        return node.localName;
    }

    protected extractAttributes(node: Element): Record<string, unknown> {
        const attributes: Record<string, unknown> = {};

        const elementAttributes = Array.from(node.attributes);
        for (const attribute of elementAttributes) {
            attributes[attribute.nodeName] = attribute.nodeValue;
        }

        return attributes;
    }

    protected extractChildren(node: Element): QuickReader[] {
        const children: QuickReader[] = [];

        const childNodes: ChildNode[] = Array.from(node.childNodes);
        for (const childNode of childNodes) {
            if (childNode.nodeType === childNode.ELEMENT_NODE) {
                children.push(this.importNode(childNode as Element));
            }
        }

        return children;
    }

    protected createQuickReader(
        name: string,
        attributes: Record<string | number | symbol, unknown>,
        children: QuickReader[]
    ): QuickReader {
        return new QuickReader(name, attributes, children);
    }
}
