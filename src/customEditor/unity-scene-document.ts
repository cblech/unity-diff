import * as vscode from 'vscode';
import SerializedUnityFileReader from '../model/unity-serialization/serialized-file-reader';
import SerializedUnityFile from '../model/unity-serialization/serialized-file';
import { FoldingInfo } from './folding-info';
import { SelectedInfo } from './selected-info';

export class UnitySceneDocument implements vscode.CustomDocument {
    uri: vscode.Uri;
    documentData: SerializedUnityFile;
    foldInfo: FoldingInfo;
    selectedInfo: SelectedInfo;


    dispose(): void {
        
    }

    public static async create(uri: vscode.Uri): Promise<UnitySceneDocument> {
        let reader = new SerializedUnityFileReader(uri);
        let file = await reader.read();
        return new UnitySceneDocument(uri, file, new FoldingInfo(), new SelectedInfo());
    }

    private constructor(uri: vscode.Uri, documentData: SerializedUnityFile, foldInfo: FoldingInfo, selectedInfo: SelectedInfo) {
        this.uri = uri;
        this.documentData = documentData;
        this.foldInfo = foldInfo;
        this.selectedInfo = selectedInfo;
    }
}