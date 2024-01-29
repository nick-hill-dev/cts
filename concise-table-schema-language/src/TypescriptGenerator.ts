import CodeWriter from "./CodeWriter";
import Cts from "./Cts";

type A = 'a' | 'b';

export default class TypescriptGenerator {

    public static generate(cts: Cts): string {
        let writer = new CodeWriter();

        for (let optionSet of cts.enums) {
            writer.writeLine(`type ${optionSet.name} = ${optionSet.values.map(o => "'" + o + "'").join(' | ')};`);
            writer.writeLine();
        }

        for (let table of cts.tables) {
            writer.writeLineThenIndent(`interface I${table.tableName} {`);
            for (let field of table.fields) {
                let jsName = field.name.length <= 2 ? field.name.toLowerCase() : field.name[0].toLowerCase() + field.name.substring(1);
                writer.writeLine(`${jsName}: ${field.jsType};`);
            }
            writer.unindent();
            writer.writeLine('}');
            writer.writeLine();
        }

        return writer.toString();
    }

}