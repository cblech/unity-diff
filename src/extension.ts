import * as vscode from 'vscode';
import CustomEditorProvider from './customEditor/custom-editor-provider';
import GitWrapper from './wrapper/git-wrapper';
import { AppContext } from './interfaces/unity-diff-context';

export function activate(context: vscode.ExtensionContext) {

	console.log('Congratulations, your extension "unity-diff" is now active!');

	let appContext: AppContext = {
		extensionContext: context,
		gitWrapper: new GitWrapper()
	};


	context.subscriptions.push(vscode.commands.registerCommand('unity-diff.helloWorld', () => {
		vscode.window.showInformationMessage('Hello World from unity-diff!');
	}));

	context.subscriptions.push(CustomEditorProvider.register(appContext));
}

export function deactivate() {}
