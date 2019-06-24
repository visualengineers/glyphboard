import { FlexiWallPosition } from './flexiWallPosition';
import { FlexiWallTouchType } from './flexiWallTouchType';

export class FlexiWallTouchPoint {
    public constructor(
        public Position: FlexiWallPosition = new FlexiWallPosition(),
        public Type: FlexiWallTouchType = FlexiWallTouchType.None,
        public Confidence: number = 0,
        public Time: number = 0) {
    }

    public ConvertedTime(): Date {
        return new Date(this.Time);
    }
}