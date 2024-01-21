export default class CtsRecordDefinition {

    public fieldValues: string[] = [];

    public targetVariableName: string | undefined;

    public constructor(public readonly tableName: string) {

    }
}