export interface Position3d {
  X: number;
  Y: number;
  Z: number;
  IsFiltered: Boolean;
  IsValid: Boolean;
}

export interface ExtremumDescription {
  Type: ExtremumType;
  NumFittingPoint: number;
  PercentageFittingPoints: number;
}

export enum ExtremumType {
  Maximum = 0,
  Minimum = 1,
  Undefined = 2
}

export enum TouchType {
  Push = 0,
  Pull = 1,
  Undefined = 2
}

export interface TouchPoint3d {
  Confidence: number;
  ExtremumDescription: ExtremumDescription;
  Position: Position3d;
  Time: number;
  TouchId: number;
  Type: ExtremumType
}
