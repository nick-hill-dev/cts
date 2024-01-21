import CtsEnumDefinition from "./CtsEnumDefinition";
import CtsFieldDefinition from "./CtsFieldDefinition";
import CtsRecordDefinition from "./CtsRecordDefinition";
import CtsTableDefinition from "./CtsTableDefinition";

export default class Cts {

    public lines: string[] = [];

    public enums: CtsEnumDefinition[] = [];

    public tables: CtsTableDefinition[] = [];

    public records: CtsRecordDefinition[] = [];

    private constructor() {
    }

    public static parse(text: string): Cts {
        const result = new Cts();
        for (const line of text.split('\n').map(l => l.trim()).filter(l => l !== '' && !l.startsWith('//'))) {
            result.lines.push(line);
            const regexPattern = /^(?<entityName>[\w.]+)(?<entityType>.)\s*(?<entityContent>.+?)\s*$/;
            const match = regexPattern.exec(line);
            const entityName = match?.groups?.entityName as string;
            const entityType = match?.groups?.entityType as string;
            const entityContent = match?.groups?.entityContent as string;

            switch (entityType) {
                case '?':
                    result.enums.push(result.parseEnum(entityName, entityContent));
                    break;

                case '>':
                    result.tables.push(result.parseTable(entityName, entityContent))
                    break;

                case '+':
                    result.records.push(result.parseRecord(entityName, entityContent));
                    break;

                case '&':
                case '@':
                    // Useful for Entities API but not useful for CTS in general
                    break;

                default:
                    throw new Error('Unknown entity type: ' + entityType);
            }

        }

        // Types in foreign key references are optional, so let's clean them up
        for (let table of result.tables) {
            for (let field of table.fields) {
                if ((field.isChild || field.isLookup)) {
                    let relatedTable = result.tables.find(t => t.tableName === field.relatedTableName);
                    let relatedField = relatedTable?.fields.find(f => f.name === field.relatedFieldName);
                    if (relatedField) {
                        field.type = relatedField.type === 'BIGSERIAL' ? 'BIGINT' : relatedField.type;
                    }
                }
            }
        }
        return result;
    }

    private parseEnum(enumName: string, line: string): CtsEnumDefinition {
        const result = new CtsEnumDefinition(enumName);
        for (let value of line.split(',').map(o => o.trim())) {
            result.values.push(value);
        }
        return result;
    }

    private parseTable(tableName: string, line: string): CtsTableDefinition {
        const result = new CtsTableDefinition(tableName);
        let i = 0;
        for (let fieldDefinition of line.split(',').map(l => l.trim())) {
            let fieldInfo = /^(?<prefix>(\w*[{~])?)(?<name>[\w.]+)(?<type>[^\w])?\s*$/.exec(fieldDefinition);
            const prefix = fieldInfo?.groups?.prefix ?? '';
            const name = fieldInfo?.groups?.name as string;
            const type = fieldInfo?.groups?.type;

            let sqlType = this.getSqlType(type, i, fieldDefinition);

            let fieldName = prefix.length > 1 ? prefix?.substring(0, prefix.length - 1) : name;
            if (prefix.length === 1 && (prefix === '{' || prefix === '~')) {
                fieldName = name.replace('.', '');
            }
            let field = new CtsFieldDefinition(fieldName);
            field.type = sqlType;
            field.isEnum = prefix.endsWith('~') && name.indexOf('.') === -1;
            field.isChild = !field.isEnum && (prefix?.endsWith('{') ?? false);
            field.isLookup = !field.isEnum && (prefix?.endsWith('~') ?? false);

            if (field.isEnum) {
                field.type = `"${name}"`;
            }

            if (field.isChild || field.isLookup) {
                let parts = name.split('.');
                field.relatedTableName = parts[0] ?? '';
                field.relatedFieldName = parts[1] ?? parts[0] ?? '';
            }

            result.fields.push(field);

            i++;
        }
        return result;
    }

    private getSqlType(type: string | undefined, fieldPosition: number, fieldDefinition: string) {
        let sqlType = 'VARCHAR';
        switch (type) {
            case '%':
                sqlType = fieldPosition === 0 ? 'BIGSERIAL' : 'BIGINT';
                break;

            case '*':
                sqlType = 'BYTEA';
                break;

            case '#':
                sqlType = 'TIMESTAMP';
                break;

            case '$':
                sqlType = 'NUMERIC(10, 2)';
                break;

            case undefined:
                break;

            default:
                throw new Error(`Unknown field type for field ${fieldDefinition}: ${type}`);
        }
        return sqlType;
    }

    private parseRecord(tableName: string, line: string): CtsRecordDefinition {
        const [csv, targetVariableName] = line.split('|');
        const result = new CtsRecordDefinition(tableName);
        result.targetVariableName = targetVariableName;
        for (let value of csv.split(',').map(o => o.trim())) {
            result.fieldValues.push(value);
        }
        return result;
    }

}