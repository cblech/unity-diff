import * as vscode from 'vscode';
import CustomEditorProvider from './customEditor/custom-editor-provider';

export function activate(context: vscode.ExtensionContext) {

	console.log('Congratulations, your extension "unity-diff" is now active!');

	context.subscriptions.push(vscode.commands.registerCommand('unity-diff.helloWorld', () => {
		vscode.window.showInformationMessage('Hello World from unity-diff!');
	}));

	context.subscriptions.push(CustomEditorProvider.register(context));
}

export function deactivate() {}
