export class RefreshHoverEventData {
  private _id;
  private _features;
  private _element;

  constructor(id: number, features: any, element: any) {
    this._id = id;
    this._features = features;
    this._element = element;
  }

  get id() { return this._id; }
  set id(value: number) { this._id = value; }
  get features() { return this._features; }
  set features(value: number) { this._features = value; }
  get element() { return this._element; }
  set element(value: number) { this._element = value; }
}
