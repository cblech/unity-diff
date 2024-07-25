export class FoldingInfo {
    private _folds: { [key: string]: boolean } = {};
    private _expandedByDefault: boolean = true;

    public setFold(key: string, expanded: boolean) {
        this._folds[key] = expanded;
    }

    public isExpanded(key: string): boolean {
        return this._folds[key] ?? this._expandedByDefault;
    }

    public getAllExpanded(): string[] {
        return Object.keys(this._folds).filter(k => this._folds[k]);
    }

    public getAllCollapsed(): string[] {
        return Object.keys(this._folds).filter(k => !this._folds[k]);
    }

    public toggleFold(key: string) {
        this.setFold(key, !this.isExpanded(key));
    }
}