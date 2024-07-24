import SerializedUnityFile, { SerializedUnityFileComponent, SerializedUnityFileDocument, SerializedUnityFileDocumentType, SerializedUnityFileGameObject, SerializedUnityFileHierarchy } from './serialized-file';
import * as yaml from 'yaml';
import * as fs from 'fs';
import * as vscode from 'vscode';

type GoIdHierarchy = { goId: string, children: GoIdHierarchy[] };

export default class SerializedUnityFileReader {
    private filePath: vscode.Uri;

    constructor(filePath: vscode.Uri) {
        this.filePath = filePath;
    }

    public async read(): Promise<SerializedUnityFile> {
        // Read the file
        let textDocument = await vscode.workspace.openTextDocument(this.filePath);
        let fileContents = textDocument.getText();

        let yamlDocuments = yaml.parseAllDocuments(fileContents);

        let unityDocuments = yamlDocuments.map(yd => this.yamlToUnityDocument(fileContents, yd));

        return new SerializedUnityFile(unityDocuments, this.buildHierarchy(unityDocuments));
    }

    private getTransformComponentDocuments(allDocuments: SerializedUnityFileDocument[]): SerializedUnityFileDocument[] {
        return allDocuments.filter(d => d.type === SerializedUnityFileDocumentType.Component && d.content["Transform"]);
    }

    private getDocumentByFileId(allDocuments: SerializedUnityFileDocument[], fileId: string | number): SerializedUnityFileDocument | null {
        return allDocuments.find(d => d.fileId === fileId + '') ?? null;
    }

    private buildHierarchyRecursive(allDocuments: SerializedUnityFileDocument[], transformDocuments: SerializedUnityFileDocument[]): GoIdHierarchy[] {
        return transformDocuments.map(d => {
            let goId = d.content.Transform.m_GameObject.fileID + '';
            let children = d.content.Transform.m_Children.map((c: { fileID: number }) => this.getDocumentByFileId(allDocuments, c.fileID));
            return { goId, children: this.buildHierarchyRecursive(allDocuments, children) };
        });
    }

    private buildGameObjectHierarchyRecursive(allDocuments: SerializedUnityFileDocument[], hierarchy: GoIdHierarchy[]): SerializedUnityFileGameObject[] {
        return hierarchy.map(h => {
            let goDocument = this.getDocumentByFileId(allDocuments, h.goId);
            if (!goDocument) { throw new Error("GameObject, referenced by Transform, not found in documents"); }

            let componentDocuments: SerializedUnityFileDocument[] = goDocument.content.GameObject.m_Component
                .map((c: { component: { fileID: number } }) => this.getDocumentByFileId(allDocuments, c.component.fileID));
            let components = componentDocuments.map((d) => new SerializedUnityFileComponent(d));

            return new SerializedUnityFileGameObject(goDocument!, components, this.buildGameObjectHierarchyRecursive(allDocuments, h.children));
        });
    }

    private buildHierarchy(allDocuments: SerializedUnityFileDocument[]): SerializedUnityFileHierarchy {
        // try to find SceneRoots
        let magicIdForRootGameObjects = '9223372036854775807';
        let sceneRootsDocument = this.getDocumentByFileId(allDocuments, magicIdForRootGameObjects);

        let rootTransformComponentDocuments: SerializedUnityFileDocument[];
        if (sceneRootsDocument) {
            rootTransformComponentDocuments = sceneRootsDocument.content.SceneRoots.m_Roots.map((r: { fileID: number }) => this.getDocumentByFileId(allDocuments, r.fileID));
        } else {
            let transformComponentDocuments = this.getTransformComponentDocuments(allDocuments);
            rootTransformComponentDocuments = transformComponentDocuments.filter(d => d.content.Transform.m_Father.fileID === 0);
        }

        let hierarchyIds = this.buildHierarchyRecursive(allDocuments, rootTransformComponentDocuments);

        let hierarchyGameObjects = this.buildGameObjectHierarchyRecursive(allDocuments, hierarchyIds);

        return new SerializedUnityFileHierarchy(hierarchyGameObjects);
    }


    private yamlToUnityDocument(originalFileContents: string, yamlDocument: yaml.Document): SerializedUnityFileDocument {
        let range = yamlDocument.range!;
        let text = originalFileContents.slice(range[0], range[1]);
        let contents = yamlDocument.contents!;
        let fieldId = contents.anchor!;
        let jsonContent = contents.toJSON();
        let type: SerializedUnityFileDocumentType;

        if (jsonContent["GameObject"]) {
            type = SerializedUnityFileDocumentType.GameObject;
        } else if (!!jsonContent[Object.keys(jsonContent)[0]].m_GameObject && !!jsonContent[Object.keys(jsonContent)[0]].m_GameObject.fileID) {
            type = SerializedUnityFileDocumentType.Component;
        } else {
            type = SerializedUnityFileDocumentType.Other;
        }

        return new SerializedUnityFileDocument(
            type,
            text,
            jsonContent,
            range,
            fieldId
        );
    }
}