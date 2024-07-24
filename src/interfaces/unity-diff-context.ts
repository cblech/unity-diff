import * as vscode from 'vscode';
import GitWrapper from '../wrapper/git-wrapper';

export interface AppContext {
    extensionContext: vscode.ExtensionContext;
    gitWrapper: GitWrapper;
}