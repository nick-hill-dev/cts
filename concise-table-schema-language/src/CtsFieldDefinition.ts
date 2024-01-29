export default class CtsFieldDefinition {

    public isEnum: boolean = false;

    public isChild: boolean = false;

    public isLookup: boolean = false;

    public relatedTableName: string | undefined;

    public relatedFieldName: string | undefined;

    public sqlType!: string;

    public jsType!: string;

    public constructor(public readonly name: string) {
    }

}