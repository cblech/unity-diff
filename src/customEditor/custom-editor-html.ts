import * as vscode from "vscode";
import { SerializedUnityFileGameObject } from "../model/unity-serialization/serialized-file";
import { UnitySceneDocument } from "./unity-scene-document";
import * as fs from 'fs';
import { AppContext } from "../interfaces/unity-diff-context";

export class CustomEditorHtml {
    static getHtml(document: UnitySceneDocument, context: vscode.WebviewPanel, extensionContext: AppContext):string {
        let scriptUri = context.webview.asWebviewUri(vscode.Uri.file(__dirname + "/prod-data/custom-editor.js"));
        let styleUri = context.webview.asWebviewUri(vscode.Uri.file(__dirname + "/prod-data/custom-editor.css"));
        const codiconsUri = context.webview.asWebviewUri(vscode.Uri.joinPath(extensionContext.extensionContext.extensionUri, 'node_modules', '@vscode/codicons', 'dist', 'codicon.css'));


        return fs.readFileSync(__dirname + "/prod-data/custom-editor.html", "utf8")
            .replace(/\$\{cspSource\}/g, context.webview.cspSource)
            .replace(/\$\{scriptUri\}/g, scriptUri.toString())
            .replace(/\$\{codiconsUri\}/g, codiconsUri.toString())
            .replace(/\$\{styleUri\}/g, styleUri.toString());
        
        
        /*html*//*`
        <div id="main-container" class="main-container">
            ${this.getStyle()}
            ${this.getHeader()}
            ${this.makeHtmlForGameObjects(document.documentData.hierarchy.rootGameObjects)}
        </div>
        `;*/
    }

    private static makeHtmlForGameObjects(gameObjects: SerializedUnityFileGameObject[]): string {
        let html = "";
        for (let gameObject of gameObjects) {
            html += `<p>${gameObject.getName()}</p>`;
            html += `<div style="margin-left:10px">${this.makeHtmlForGameObjects(gameObject.children)}</div>`;
        }
        return html;
    }
}