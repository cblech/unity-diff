import * as vscode from 'vscode';
import { UnitySceneDocument } from './unity-scene-document';
import { SerializedUnityFileGameObject } from '../model/unity-serialization/serialized-file';
import * as git from '../interfaces/git-extension';
import { AppContext } from '../interfaces/unity-diff-context';
import { CustomEditorHtml } from './custom-editor-html';


export default class CustomEditorProvider implements vscode.CustomEditorProvider<UnitySceneDocument> {

    static register(context: AppContext): { dispose(): any; } {
        return vscode.window.registerCustomEditorProvider(
            "unity-diff.unityScene",
            new CustomEditorProvider(context),
            {
                supportsMultipleEditorsPerDocument: false,
            });
    }

    constructor(
        private readonly _context: AppContext
    ) { }

    onDidChangeCustomDocument:
        vscode.Event<vscode.CustomDocumentEditEvent<UnitySceneDocument>> |
        vscode.Event<vscode.CustomDocumentContentChangeEvent<UnitySceneDocument>> = new vscode.EventEmitter<vscode.CustomDocumentEditEvent<UnitySceneDocument>>().event;

    saveCustomDocument(document: UnitySceneDocument, cancellation: vscode.CancellationToken): Thenable<void> {
        //throw new Error('Method not implemented.');
        return Promise.resolve();
    }

    saveCustomDocumentAs(document: UnitySceneDocument, destination: vscode.Uri, cancellation: vscode.CancellationToken): Thenable<void> {
        //throw new Error('Method not implemented.');
        return Promise.resolve();
    }

    revertCustomDocument(document: UnitySceneDocument, cancellation: vscode.CancellationToken): Thenable<void> {
        //throw new Error('Method not implemented.');
        return Promise.resolve();
    }

    backupCustomDocument(document: UnitySceneDocument, context: vscode.CustomDocumentBackupContext, cancellation: vscode.CancellationToken): Thenable<vscode.CustomDocumentBackup> {
        throw new Error('Method not implemented.');
    }

    openCustomDocument(uri: vscode.Uri, openContext: vscode.CustomDocumentOpenContext, token: vscode.CancellationToken): Thenable<UnitySceneDocument> | UnitySceneDocument {
        return new Promise<UnitySceneDocument>((resolve, _) => {
            UnitySceneDocument.create(uri)
                .then((doc) => {
                    resolve(doc);
                });
        });
    }

    resolveCustomEditor(document: UnitySceneDocument, webviewPanel: vscode.WebviewPanel, token: vscode.CancellationToken): Thenable<void> | void {
        var html = CustomEditorHtml.getHtml(document, webviewPanel, this._context);
        webviewPanel.webview.options = { enableScripts: true };
        webviewPanel.webview.html = html;

        function postFillHierarchy() {
            webviewPanel.webview.postMessage({ command: "fill-hierarchy", hierarchy: document.documentData.hierarchy });
        }

        function postApplyFolds(){
            webviewPanel.webview.postMessage({command: "apply-folds", collapsed: document.foldInfo.getAllCollapsed()});
        }

        webviewPanel.webview.onDidReceiveMessage((message) => {
            console.log(message);
            switch (message.command) {
                case "fold-hierarchy":
                    document.foldInfo.toggleFold(message.fileId);
                    postApplyFolds();
                    break;
            }
        });

        postFillHierarchy();
        postApplyFolds();

        // this.makeHtmlForGameObjects(document.documentData.hierarchy.rootGameObjects);
        //webviewPanel.webview.html += JSON.stringify(document.uri, null, "  ");
        //
        //if (this._context.gitWrapper.hasFileMergeConflict(document.uri)) {
        //    webviewPanel.webview.html += "<h1>File is in merge conflict</h1>";
        //}
        //
        //if(this._context.gitWrapper.hasFileChanges(document.uri)) {
        //    webviewPanel.webview.html += "<h1>File has changes</h1>";
        //}
        //
        //console.log(vscode.window.tabGroups.activeTabGroup.activeTab?.input);
    }

    makeHtmlForGameObjects(gameObjects: SerializedUnityFileGameObject[]): string {
        let html = "";
        for (let gameObject of gameObjects) {
            html += `<p>${gameObject.getName()}</p>`;
            html += `<div style="margin-left:10px">${this.makeHtmlForGameObjects(gameObject.children)}</div>`;
        }
        return html;
    }
}