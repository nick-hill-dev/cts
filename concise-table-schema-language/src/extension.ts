import * as vscode from 'vscode';
import Cts from './Cts';
import SqlGenerator from './SqlGenerator';
import TypescriptGenerator from './TypescriptGenerator';

function activate(context: vscode.ExtensionContext) {
   let createSqlScriptCommand = vscode.commands.registerCommand('extension.createSqlScript', () => {
      const activeEditor = vscode.window.activeTextEditor;

      if (activeEditor) {
         const document = activeEditor.document;
         const cts = Cts.parse(document.getText());
         const content = SqlGenerator.generate(cts);
         
         // Open a new untitled document with the copied content
         vscode.workspace.openTextDocument({ content, language: 'sql' }).then((newDocument) => {
            vscode.window.showTextDocument(newDocument);
         });

      } else {
         vscode.window.showInformationMessage('This action can only be performed on an visible .cts file. Please open a .cts file and try again.');
      }
   });
   
   let createTypescriptCommand = vscode.commands.registerCommand('extension.createTypescript', () => {
      const activeEditor = vscode.window.activeTextEditor;

      if (activeEditor) {
         const document = activeEditor.document;
         const cts = Cts.parse(document.getText());
         const content = TypescriptGenerator.generate(cts);
         
         // Open a new untitled document with the copied content
         vscode.workspace.openTextDocument({ content, language: 'typescript' }).then((newDocument) => {
            vscode.window.showTextDocument(newDocument);
         });

      } else {
         vscode.window.showInformationMessage('This action can only be performed on an visible .cts file. Please open a .cts file and try again.');
      }
   });

   context.subscriptions.push(createSqlScriptCommand);
   context.subscriptions.push(createTypescriptCommand);
}

exports.activate = activate;
