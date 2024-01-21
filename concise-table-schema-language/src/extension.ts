import * as vscode from 'vscode';
import CodeWriter from './CodeWriter';
import Cts from './Cts';

function activate(context: vscode.ExtensionContext) {
   let disposable = vscode.commands.registerCommand('extension.createSqlScript', () => {
      const activeEditor = vscode.window.activeTextEditor;

      if (activeEditor) {
         const document = activeEditor.document;
         const cts = Cts.parse(document.getText());

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
               fieldLines.push(`"${field.name}" ${field.type} ${nullability}`);
               i++;
            }
            for (let field of table.fields.filter(f => f.isChild || f.isLookup)) {
               let ref = `CONSTRAINT "${table.tableName}_${field.name}_FKey" FOREIGN KEY ("${field.name}") REFERENCES "${field.relatedTableName}" ("${field.relatedFieldName}")`;
               if (field.isChild) {
                  fieldLines.push(`${ref} ON UPDATE CASCADE ON DELETE CASCADE`);
               } else {
                  fieldLines.push(`${ref} UPDATE RESTRICT ON DELETE SET NULL`);
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
            let actualFields = [];
            for (let fieldValue of record.fieldValues) {
               if (fieldValue.startsWith('[') && fieldValue.endsWith(']')) {
                  const variableName = fieldValue.substring(1, fieldValue.length - 1);
                  actualFields.push(`"${variableName}.${variableName}"`);
               } else {
                  actualFields.push(`'${fieldValue}'`);
               }
            }

            let statement = `INSERT INTO "${record.tableName}" VALUES (${actualFields.join(', ')})`;
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
        
         const content = writer.toString();

         // Open a new untitled document with the copied content
         vscode.workspace.openTextDocument({ content, language: 'sql' }).then((newDocument) => {
            vscode.window.showTextDocument(newDocument);
         });

      } else {
         vscode.window.showInformationMessage('This action can only be performed on an visible .cts file. Please open a .cts file and try again.');
      }
   });

   context.subscriptions.push(disposable);
}

exports.activate = activate;
