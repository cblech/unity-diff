import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {

	console.log('Congratulations, your extension "unity-diff" is now active!');

	const disposable = vscode.commands.registerCommand('unity-diff.helloWorld', () => {
		vscode.window.showInformationMessage('Hello World from unity-diff!');
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {}
