import * as vscode from "vscode";
import * as fs from 'fs';
import { AppContext } from "../interfaces/unity-diff-context";

export class CustomEditorHtml {
    static getHtml(context: vscode.WebviewPanel, extensionContext: AppContext):string {
        const scriptUri = context.webview.asWebviewUri(vscode.Uri.file(__dirname + "/prod-data/custom-editor.js"));
        const styleUri = context.webview.asWebviewUri(vscode.Uri.file(__dirname + "/prod-data/custom-editor.css"));
        const treeScriptUri = context.webview.asWebviewUri(vscode.Uri.file(__dirname + "/prod-data/tree-view.js"));
        const inspectorScriptUri = context.webview.asWebviewUri(vscode.Uri.file(__dirname + "/prod-data/inspector-view.js"));
        const treeStyleUri = context.webview.asWebviewUri(vscode.Uri.file(__dirname + "/prod-data/tree-view.css"));
        const inspectorStyleUri = context.webview.asWebviewUri(vscode.Uri.file(__dirname + "/prod-data/inspector-view.css"));
        const codiconsUri = context.webview.asWebviewUri(vscode.Uri.joinPath(extensionContext.extensionContext.extensionUri, 'node_modules', '@vscode/codicons', 'dist', 'codicon.css'));


        return fs.readFileSync(__dirname + "/prod-data/custom-editor.html", "utf8")
            .replace(/\$\{cspSource\}/g, context.webview.cspSource)
            .replace(/\$\{scriptUri\}/g, scriptUri.toString())
            .replace(/\$\{codiconsUri\}/g, codiconsUri.toString())
            .replace(/\$\{treeScriptUri\}/g, treeScriptUri.toString())
            .replace(/\$\{inspectorScriptUri\}/g, inspectorScriptUri.toString())
            .replace(/\$\{treeStyleUri\}/g, treeStyleUri.toString())
            .replace(/\$\{inspectorStyleUri\}/g, inspectorStyleUri.toString())
            .replace(/\$\{styleUri\}/g, styleUri.toString());
    }
}