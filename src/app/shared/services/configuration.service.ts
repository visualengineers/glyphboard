import { FlowerGlyphConfiguration } from 'src/app/glyph/glyph.flower.configuration';
import { StarGlyphConfiguration } from 'src/app/glyph/glyph.star.configuration';
import { Logger } from 'src/app/shared/services/logger.service';
import { Injectable } from '@angular/core';
import { ConfigurationData } from './configuration.data';
import { SelectionService } from './selection.service';
import { GlyphConfiguration } from 'src/app/glyph/glyph.configuration';
import { GlyphType } from 'src/app/glyph/glyph.type';
import { EventAggregatorService } from 'src/app/shared/events/event-aggregator.service';

@Injectable()
export class Configuration {
    private _flowerConfigs = new Array<GlyphConfiguration>();
    private _starConfigs = new Array<GlyphConfiguration>();
    private _activeGlyphType = GlyphType.Flower;
    private _configurations: Array<ConfigurationData>;
    private _dataSetRequest = 0;
    // whether or not the split screen is activated
    private _splitScreenActive = false;
    private _smallGlyphRadius = 20;
    private _largeGlyphRadius = 50;
    private _legendGlyphRadius = 60;

    constructor(private logger: Logger, private eventAggregator: EventAggregatorService, private selectionService: SelectionService) {
        const flowerConfig = new FlowerGlyphConfiguration();
        flowerConfig.radius = this.largeGlyphRadius;
        const smallFlowerConfig = new FlowerGlyphConfiguration();
        smallFlowerConfig.radius = this.smallGlyphRadius;
        smallFlowerConfig.useCoordinateSystem = false;
        smallFlowerConfig.useCircle = false;
        smallFlowerConfig.useBrightness = true;
        smallFlowerConfig.useArea = false;
        smallFlowerConfig.usePetals = true;
        this.flowerConfigs.push(smallFlowerConfig);
        this.flowerConfigs.push(smallFlowerConfig);
        this.flowerConfigs.push(flowerConfig);

        const starConfig = new StarGlyphConfiguration();
        starConfig.radius = this.largeGlyphRadius;
        const smallStarConfig = new StarGlyphConfiguration();
        smallStarConfig.radius = this.smallGlyphRadius;
        smallStarConfig.useCoordinateSystem = false;
        smallStarConfig.useContour = true;
        smallStarConfig.useAreaFill = true;
        smallStarConfig.useAbsoluteAxes = false;
        this.starConfigs.push(smallStarConfig);
        this.starConfigs.push(smallStarConfig);
        this.starConfigs.push(starConfig);

        this._configurations = new Array<ConfigurationData>();
    }

    public addConfiguration() {
        const config = new ConfigurationData(this.eventAggregator);
        this._configurations.push(config);
        return config;
    }

    get configurations(): Array<ConfigurationData> { return this._configurations; }

    get dataSetRequest() { return this._dataSetRequest; }
    set dataSetRequest(value: number) { this._dataSetRequest = value; }

    get splitScreenActive() { return this._splitScreenActive; }
    set splitScreenActive(value: boolean) { this._splitScreenActive = value; }

    get flowerConfigs() { return this._flowerConfigs; }
    set flowerConfigs(value: Array<GlyphConfiguration>) { this._flowerConfigs = value; }

    get starConfigs() { return this._starConfigs; }
    set starConfigs(value: Array<GlyphConfiguration>) { this._starConfigs = value; }

    get activeGlyphType() { return this._activeGlyphType; }
    set activeGlyphType(value: GlyphType) { this._activeGlyphType = value; }

    get smallGlyphRadius() { return this._smallGlyphRadius; }
    set smallGlyphRadius(value: number) { this._smallGlyphRadius = value; }

    get largeGlyphRadius() { return this._largeGlyphRadius; }
    set largeGlyphRadius(value: number) { this._largeGlyphRadius = value; }

    get legendGlyphRadius(): number { return this._legendGlyphRadius; }
    set legendGlyphRadius(value: number) { this._legendGlyphRadius = value; }

    public activeGlyphConfig(): GlyphConfiguration {
        switch (this.activeGlyphType) {
            case GlyphType.Star:
                return this.starConfigs[2];
            default:
                return this.flowerConfigs[2];
        }
    }
}
