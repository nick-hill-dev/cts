import CodeWriter from "./CodeWriter";
import Cts from "./Cts";

export default class SqlGenerator {

    public static generate(cts: Cts): string {
        let writer = new CodeWriter();

        for (let optionSet of cts.enums) {
            writer.writeLine(`CREATE TYPE "${optionSet.name}" AS ENUM (${optionSet.values.map(o => "'" + o + "'").join(', ')});`);
            writer.writeLine();
        }

        for (let table of cts.tables) {
            writer.writeLineThenIndent(`CREATE TABLE "${table.tableName}" (`);
            let i = 0;
            let fieldLines = [];
            for (let field of table.fields) {
                const nullability = i === 0 ? 'PRIMARY KEY' : 'NULL';
                fieldLines.push(`"${field.name}" ${field.sqlType} ${nullability}`);
                i++;
            }
            for (let field of table.fields.filter(f => f.isChild || f.isLookup)) {
                let ref = `CONSTRAINT "${table.tableName}_${field.name}_FKey" FOREIGN KEY ("${field.name}") REFERENCES "${field.relatedTableName}" ("${field.relatedFieldName}")`;
                if (field.isChild) {
                    fieldLines.push(`${ref} ON UPDATE CASCADE ON DELETE CASCADE`);
                } else {
                    fieldLines.push(`${ref} ON UPDATE RESTRICT ON DELETE SET NULL`);
                }
            }
            let j = 0;
            for (let fieldLine of fieldLines) {
                writer.write(fieldLine);
                if (++j < fieldLines.length) {
                    writer.write(',');
                }
                writer.writeLine();
            }
            writer.unindent();
            writer.writeLine(`);`);
            writer.writeLine();
        }

        // TODO: Experimental, and does not currently work
        /*
        for (let record of cts.records) {
            const table = cts.tables.find(t => t.tableName === record.tableName);
            if (!table) {
                continue;
            }

            let actualFields = [];
            for (let fieldValue of record.fieldValues) {
                if (fieldValue.startsWith('[') && fieldValue.endsWith(']')) {
                    const variableName = fieldValue.substring(1, fieldValue.length - 1);
                    actualFields.push(`"${variableName}.${variableName}"`);
                } else {
                    actualFields.push(`'${fieldValue}'`);
                }
            }

            const fieldNames = table.fields.map(f => `"${f.name}"`) ?? [];
            let statement = `INSERT INTO "${record.tableName}" (${fieldNames.join(', ')}) VALUES (${actualFields.join(', ')})`;
            if (record.targetVariableName) {
                let table = cts.tables.find(t => t.tableName === record.tableName);
                writer.writeLineThenIndent(`WITH "${record.targetVariableName}" AS (`);
                writer.writeLine(`${statement} RETURNING "${table?.fields[0].name}" AS "${record.targetVariableName}"`);
                writer.unindent();
                writer.writeLine(`)`)

            } else {
                writer.writeLine(`${statement}`);
            }

        }
        */

        return writer.toString();
    }

}