import * as git from '../interfaces/git-extension';
import * as vscode from 'vscode';

export default class GitWrapper {
    private _gitAvailable: boolean = false;
    private _gitApi: git.API | null = null;


    constructor() {
        let gitExtension = vscode.extensions.getExtension('vscode.git');

        if (!gitExtension) {
            this._gitAvailable = false;
            return;
        }
        this._gitAvailable = true;

        gitExtension.activate()
            .then((extension:git.GitExtension) => {
                this._gitApi = extension.getAPI(1);
                this._gitApi.onDidChangeState(async (state: git.APIState) => {
                    this._gitApi;
                    let refs = await this._gitApi!.repositories[0].getRefs( {  } );
                    console.log("Git state changed");
                });
            });
    }


    // public interface
    //public onGitChangeState(callback: (state: git.APIState) => void): void {
    //    if (this._gitApi) {
    //        this._gitApi.onDidChangeState(callback);
    //    }
    //}

    public isGitAvailable(): boolean {
        return this._gitAvailable;
    }

    public isGitLoaded(): boolean {
        return this._gitApi !== null;
    }

    public hasFileChanges(uri: vscode.Uri): boolean {
        if (!this._gitApi) {
            return false;
        }

        return this._gitApi.getRepository(uri)?.state.workingTreeChanges.some(c => c.uri.fsPath === uri.fsPath) ?? false;
    }

    public hasFileMergeConflict(uri: vscode.Uri): boolean {
        if (!this._gitApi) {
            return false;
        }

        return this._gitApi.getRepository(uri)?.state.mergeChanges.some(c => c.uri.fsPath === uri.fsPath) ?? false;
    }
}
