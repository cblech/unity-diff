export class SelectedInfo {
    private _selected: string = "";
    public constructor(){

    }

    public setSelected(selected: string){
        this._selected = selected;
    }

    getSelected(): string {
        return this._selected;
    }
}