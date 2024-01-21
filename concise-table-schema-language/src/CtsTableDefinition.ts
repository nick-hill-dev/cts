import CtsFieldDefinition from "./CtsFieldDefinition";

export default class CtsTableDefinition {

    public fields: CtsFieldDefinition[] = [];

    public constructor(public readonly tableName: string) {
    }

}