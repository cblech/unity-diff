import * as vscode from 'vscode';
import SerializedUnityFileReader from '../model/unity-serialization/serialized-file-reader';
import SerializedUnityFile from '../model/unity-serialization/serialized-file';

export class UnitySceneDocument implements vscode.CustomDocument {
    uri: vscode.Uri;
    documentData: SerializedUnityFile;
    

    dispose(): void {
        
    }

    public static async create(uri: vscode.Uri): Promise<UnitySceneDocument> {
        let reader = new SerializedUnityFileReader(uri);
        let file = await reader.read();
        return new UnitySceneDocument(uri,file);
    }

    private constructor(uri: vscode.Uri, documentData: SerializedUnityFile) {
        this.uri = uri;
        this.documentData = documentData;
    }
}