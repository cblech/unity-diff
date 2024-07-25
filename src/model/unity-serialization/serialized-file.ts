import { Range } from "yaml";

export default class SerializedUnityFile {
    public documents: SerializedUnityFileDocument[];
    public hierarchy: SerializedUnityFileHierarchy;

    constructor(documents: SerializedUnityFileDocument[], hierarchy: SerializedUnityFileHierarchy) {
        this.documents = documents;
        this.hierarchy = hierarchy;
    }

    public getGameObjectDocumentsByType(type: SerializedUnityFileDocumentType): SerializedUnityFileDocument[] {
        return this.documents.filter(d => d.type === type);
    }

    public getDocumentByFileId(fileId: string | number): SerializedUnityFileDocument | null {
        return this.documents.find(d => d.fileId === fileId + '') ?? null;
    }
}

export enum SerializedUnityFileDocumentType {
    GameObject,
    Component,
    Other
}

export class SerializedUnityFileDocument {
    public type: SerializedUnityFileDocumentType;
    public text: string;
    public content: any;
    public range: Range;
    public fileId: string;

    constructor(type: SerializedUnityFileDocumentType, text: string, content: any, range: Range, fileId: string) {
        this.type = type;
        this.text = text;
        this.content = content;
        this.range = range;
        this.fileId = fileId;
    }
}

export class SerializedUnityFileHierarchy {
    public rootGameObjects: SerializedUnityFileGameObject[];

    constructor(rootGameObjects: SerializedUnityFileGameObject[]) {
        this.rootGameObjects = rootGameObjects;
    }
}

export class SerializedUnityFileGameObject {
    public document: SerializedUnityFileDocument;
    public components: SerializedUnityFileComponent[];
    public children: SerializedUnityFileGameObject[];
    public name: string;

    constructor(document: SerializedUnityFileDocument, components: SerializedUnityFileComponent[], children: SerializedUnityFileGameObject[]) {
        this.document = document;
        this.components = components;
        this.children = children;
        this.name = document.content.GameObject.m_Name;
    }

    public getName(): string {
        return this.document.content.GameObject.m_Name;
    }
}

export class SerializedUnityFileComponent {
    public document: SerializedUnityFileDocument;

    constructor(document: SerializedUnityFileDocument) {
        this.document = document;
    }
}