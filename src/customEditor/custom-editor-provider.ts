import * as vscode from 'vscode';
import { UnitySceneDocument } from './unity-scene-document';
import { SerializedUnityFileDocumentType, SerializedUnityFileGameObject, SerializedUnityFileHierarchy } from '../model/unity-serialization/serialized-file';
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
        function postMessage(message:
            { command: "fill-hierarchy", hierarchy: SerializedUnityFileHierarchy } |
            { command: "fill-inspector", inspectorContent: InspectorContent } |
            { command: "set-selection", fileId: string } |
            { command: "apply-folds", collapsed: string[] }) {
            webviewPanel.webview.postMessage(message);
        }

        var html = CustomEditorHtml.getHtml(webviewPanel, this._context);
        webviewPanel.webview.options = { enableScripts: true };
        webviewPanel.webview.html = html;

        function postFillHierarchy() {
            postMessage({ command: "fill-hierarchy", hierarchy: document.documentData.hierarchy });
        }

        interface Property {
            key: string;
            value: string;
            link?: { fileID: string } | null;
        }

        interface Block {
            properties: Property[];
            header: string;
        }

        interface InspectorContent {
            blocks: Block[];
        }

        function postFillInspector() {
            let gameObject = document.documentData.getGameObjectByFileId(document.selectedInfo.getSelected());
            // select any GameObject for now
            //let gameObject = document.documentData.hierarchy.rootGameObjects[0];

            if (!gameObject) {
                postMessage({
                    command: "fill-inspector",
                    inspectorContent: {
                        blocks: [
                            {
                                header: "No GameObject selected",
                                properties: []
                            }
                        ]
                    }
                });
                return;
            }

            function makeReferenceProperty(key: string, value: { fileID: string }): { value: string, link: { fileID: string } | null } {
                if (!value || !value.fileID || value.fileID === "0") {
                    return { value: "None", link: null };
                }

                // find fileID
                let docByFileId = document.documentData.getDocumentByFileId(value.fileID);

                // is GameObject
                if (docByFileId?.type === SerializedUnityFileDocumentType.GameObject) {
                    return { value: docByFileId.content["GameObject"]["m_Name"] + " (GameObject)", link: { fileID: value.fileID } };
                }

                // is component
                if (docByFileId?.type === SerializedUnityFileDocumentType.Component) {
                    let contentKey = Object.keys(docByFileId.content)[0];
                    let componentGameObjectInfo = docByFileId.content[contentKey]["m_GameObject"];
                    let parentGameObject = document.documentData.getDocumentByFileId(componentGameObjectInfo.fileID);
                    let parentGoName = parentGameObject?.content["GameObject"]["m_Name"] ?? "Unknown GameObject";

                    return { value: contentKey + " on " + parentGoName, link: { fileID: value.fileID } };
                }

                return { value: "Unknown reference", link: { fileID: value.fileID } };
            }

            function makePropertiesRecursive(obj: any, indent: string = ""): Property[] {
                let properties: Property[] = [];

                for (let key in obj) {
                    if (Array.isArray(obj[key])) {
                        properties.push({ key: indent + key, value: "Array (" + obj[key].length + ")" });
                        for (let innerKey of obj[key]) {
                            if (Object.keys(innerKey).includes("fileID")) {
                                let referenceProperty = makeReferenceProperty(key, innerKey);
                                properties.push({
                                    key: indent + "&ensp;|&ensp;",
                                    value: "<span class='inspector-external-symbol codicon codicon-link-external'></span> " + referenceProperty.value,
                                    link: referenceProperty.link
                                });
                            } else {
                                properties.push(...makePropertiesRecursive(innerKey, indent + "&ensp;|&ensp;"));
                            }
                        }
                    } else if (typeof obj[key] === "object") {
                        if (Object.keys(obj[key]).includes("fileID")) {
                            let referenceProperty = makeReferenceProperty(key, obj[key]);
                            properties.push({
                                key: indent + key,
                                value: "<span class='inspector-external-symbol codicon codicon-link-external'></span> " + referenceProperty.value,
                                link: referenceProperty.link
                            });
                        } else {
                            properties.push({ key: indent + key, value: "" });
                            properties.push(...makePropertiesRecursive(obj[key], indent + "&emsp;"));
                        }

                    } else {
                        properties.push({ key: indent + key, value: obj[key] });
                    }
                }
                return properties;
            }

            let gameObjectBlock: Block = {
                properties: makePropertiesRecursive(gameObject.document.content.GameObject),
                header: gameObject.getName() + " (GameObject)"
            };

            let componentBlocks = gameObject.components.map((component) => {
                let componentName = Object.keys(component.document.content)[0];
                let componentContent = component.document.content[componentName];

                let block: Block = {
                    properties: makePropertiesRecursive(componentContent), header: componentName
                };

                return block;
            });


            let inspectorContent: InspectorContent = {
                blocks: [gameObjectBlock, ...componentBlocks]
            };

            postMessage({ command: "fill-inspector", inspectorContent: inspectorContent });
        }

        function postSetSelection() {
            postMessage({ command: "set-selection", fileId: document.selectedInfo.getSelected() });
        }

        function postApplyFolds() {
            postMessage({ command: "apply-folds", collapsed: document.foldInfo.getAllCollapsed() });
        }

        webviewPanel.webview.onDidReceiveMessage((message) => {
            console.log(message);
            switch (message.command) {
                case "fold-hierarchy":
                    document.foldInfo.toggleFold(message.fileId);
                    postApplyFolds();
                    break;
                case "select-game-object":
                    let fileId = message.fileId;
                    document.selectedInfo.setSelected(fileId);
                    postFillInspector();
                    postSetSelection();
                    break;
            }
        });



        postFillHierarchy();
        postApplyFolds();
        postFillInspector();

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