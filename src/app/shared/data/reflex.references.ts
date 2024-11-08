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
  Type: ExtremumType;
}

export enum TouchInteractionMode {
  None = -1,
  Info = 0,
  ZoomIn = 1,
  ZoomOut = 2,
  PanAnchor = 3,
  PanDirection = 4,
  Reset = 5
}

export interface InteractiveTouchPoint {
  originalPoint: TouchPoint3d;
  mode: TouchInteractionMode;
  strength: number;
  rotation: number;
}

export interface PointVisualization {
  interaction: InteractiveTouchPoint;
  screenPositionX: number;
  screenPositionY: number;
}

export interface TouchPointVelocityMap {
  touchId: number;
  confidence: number;
  zValue: number;
}

export interface TouchPointVelocityDescription {
  pos: number;
  neg: number;
}
