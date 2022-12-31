export class QuickReader {
    protected _name: string;
    protected _attributes: Record<string, string>;
    protected _children: QuickReader[];

    constructor(
        name: string,
        attributes: Record<string | number | symbol, unknown> = {},
        children: QuickReader[] = []
    ) {
        if (name === '') {
            throw new TypeError('Property name cannot be empty');
        }

        for (const [, entry] of Object.entries(attributes).entries()) {
            const [key, value] = entry;
            if (typeof key !== 'string' || key === '') {
                throw new TypeError('There is an attribute with empty or non string name');
            }

            if (typeof value !== 'string') {
                throw new TypeError(`The attribute '${key}' has a non string value`);
            }
        }

        for (const [index, child] of children.entries()) {
            if (!(child instanceof QuickReader)) {
                throw new TypeError(`The child ${index} is not an instance of ${QuickReader.name}`);
            }
        }

        this._name = name;
        this._attributes = attributes as Record<string, string>;
        this._children = children;
    }

    public get children(): {
        (name?: string): QuickReader[];
        get(name: string): QuickReader;
        has(name: string): boolean;
    } {
        const childrenFunction = (name?: string): QuickReader[] => this.__invoke(name);
        childrenFunction.get = (name: string): QuickReader => this.__get(name);
        childrenFunction.has = (name: string): boolean => this.__isset(name);

        return childrenFunction;
    }

    public __invoke(name = ''): QuickReader[] {
        if (name === '') {
            return this._children;
        }

        return this._children.filter((item) => this.namesAreEqual(name, item.toString()));
    }

    public __get(name: string): QuickReader {
        let child = this.getChildByName(name);
        if (!child) {
            child = new QuickReader(name);
        }

        return child;
    }

    public __isset(name: string): boolean {
        return this.getChildByName(name) instanceof QuickReader;
    }

    public get attributes(): {
        get(name: string): string;
        has(name: string): boolean;
    } {
        return {
            get: (name: string): string => this.offsetGet(name),
            has: (name: string): boolean => this.offsetExists(name)
        };
    }

    public offsetExists(name: string): boolean {
        return this.getAttributeByName(name) !== undefined;
    }

    public offsetGet(name: string): string {
        return this.getAttributeByName(name) ?? '';
    }

    public toString(): string {
        return this._name;
    }

    protected getAttributeByName(name: string): string | undefined {
        for (const [, entry] of Object.entries(this._attributes).entries()) {
            const [key, value] = entry;
            if (this.namesAreEqual(name, key)) {
                return value;
            }
        }

        return undefined;
    }

    protected getChildByName(name: string): QuickReader | undefined {
        for (const child of this._children) {
            if (this.namesAreEqual(name, child.toString())) {
                return child;
            }
        }

        return undefined;
    }

    protected namesAreEqual(first: string, second: string): boolean {
        return first.toLowerCase() === second.toLowerCase();
    }
}
