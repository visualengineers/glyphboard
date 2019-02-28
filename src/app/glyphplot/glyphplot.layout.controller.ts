import { GlyphplotComponent } from './glyphplot.component';
import { Logger } from 'app/shared/services/logger.service';
import * as d3 from 'd3';
import { Configuration } from '../shared/services/configuration.service';
import { DotGlyphConfiguration } from '../glyph/glyph.dot.configuration';

export class GlyphplotLayoutController {
  constructor(
      private component: GlyphplotComponent,
      private logger: Logger,
      private configurationService: Configuration) {
  }

  public drawSingleGlyph(
    position: {x: number, y: number},
    feature: any,
    progress: number,
    isPassive: boolean,
    isHighligted: boolean,
    animationProgress: number): void {
    this.component.configuration.currentLevelOfDetail < 1
      ? this.component.circle.draw(position, feature, progress, isPassive, isHighligted, animationProgress)
      : this.component.configuration.glyph.draw(position, feature, progress, isPassive, isHighligted, animationProgress);
  }

  public updatePositions(): void {
    let minX = 0,
      maxX = 0,
      minY = 0,
      maxY = 0;

    this.component.configuration.itemsCount = this.component.data.positions.length;

    this.component.data.positionsRaw = [];

    this.component.data.positions.forEach(d => {
      if (d.position.ox === undefined && parseFloat(d.position.x) < minX) {
        minX = parseFloat(d.position.x);
      } else if (parseFloat(d.position.ox) < minX) {
        minX = parseFloat(d.position.ox);
      }
      if (d.position.ox === undefined && parseFloat(d.position.x) > maxX) {
        maxX = parseFloat(d.position.x);
      } else if (parseFloat(d.position.ox) > maxX) {
        maxX = parseFloat(d.position.ox);
      }
      if (d.position.oy === undefined && parseFloat(d.position.y) < minY) {
        minY = parseFloat(d.position.y);
      } else if (parseFloat(d.position.oy) < minY) {
        minY = parseFloat(d.position.oy);
      }
      if (d.position.oy === undefined && parseFloat(d.position.y) > maxY) {
        maxY = parseFloat(d.position.y);
      } else if (parseFloat(d.position.oy) > maxY) {
        maxY = parseFloat(d.position.oy);
      }
      if (d.position.ox === undefined) {
        this.component.data.positionsRaw.push([d.position.x, d.position.y, d]);
      } else {
        this.component.data.positionsRaw.push([
          d.position.ox,
          d.position.oy,
          d
        ]);
      }
    });

    this.component.xAxis = d3
      .scaleLinear()
      .domain([minX + minX / 20, maxX - minX / 20])
      .range([5, this.component.width - 5]);

    this.component.yAxis = d3
      .scaleLinear()
      .domain([minY + minY / 20, maxY - minY / 20])
      .range([this.component.height - 5, 5]);

    const accessorScale = d3
      .scaleLinear()
      .domain([0, 1])
      .range([0, 100]);

    this.component.quadtree = d3
      .quadtree()
      .x(d => this.component.xAxis(d[0]))
      .y(d => this.component.yAxis(d[1]))
      .addAll(this.component.data.positionsRaw);

    this.component.clusterPoints = [];
    const clusterRange = 15;

    for (let x = 0; x <= this.component.width; x += clusterRange) {
      for (let y = 0; y <= this.component.height; y += clusterRange) {
        const searched = this.search(
          this.component.quadtree,
          x,
          y,
          x + clusterRange,
          y + clusterRange
        );

        const centerPoint = searched.reduce(
          function(prev, current) {
            return [prev[0] + current[0], prev[1] + current[1]];
          },
          [0, 0]
        );

        centerPoint[0] = centerPoint[0] / searched.length;
        centerPoint[1] = centerPoint[1] / searched.length;
        centerPoint.push(searched);

        if (centerPoint[0] && centerPoint[1]) {
          this.component.clusterPoints.push(searched);
        }
      }
    }

    this.component.data.clusterPositions = [];
    this.component.data.positions.forEach(d => {
      for (const element in this.component.clusterPoints) {
        if (this.component.clusterPoints.hasOwnProperty(element)) {
          const point = this.component.clusterPoints[element];
          if (point[0][2].id === d.id) {
            d.position.weight = point.length;
            this.component.data.clusterPositions.push(d);
            continue;
          }
        }
      }
    });

    if (this.component.dataUpdated) {
      // empty accessors in case of updating
      const accessors = [];

      // for every feature in the schema, add an accessor for the glyphs
      this.component.data.schema.glyph.forEach(feat => {
        accessors.push(d => {
          return accessorScale(d[feat]);
        });
      });

      this.configurationService.flowerConfigs[1].accessors = accessors;
      this.configurationService.flowerConfigs[2].accessors = accessors;
      this.configurationService.starConfigs[1].accessors = accessors;
      this.configurationService.starConfigs[2].accessors = accessors;

      this.component.dataUpdated = false;
    }

    // use ox and oy so that original x and y can be stay unchanged. Then the zoom transformation
    // can simply be applied to the original coordinates to get target tx and ty for animation
    this.component.data.positions.forEach(d => {
      if (d.position.ox === undefined) {
        d.position.ox = d.position.x;
      }
      if (d.position.oy === undefined) {
        d.position.oy = d.position.y;
      }
    });
  }

  // Find the nodes within the specified rectangle.
  private search(quadtree, x0, y0, x3, y3) {
    const that = this;
    const validData = [];
    quadtree.visit(function(node, x1, y1, x2, y2) {
      const p = node.data;
      if (p) {
        p.selected =
          that.component.xAxis(p[0]) >= x0 &&
          that.component.xAxis(p[0]) < x3 &&
          that.component.yAxis(p[1]) >= y0 &&
          that.component.yAxis(p[1]) < y3;
        if (p.selected) {
          validData.push(p);
        }
      }
      return x1 >= x3 || y1 >= y3 || x2 < x0 || y2 < y0;
    });
    return validData;
  }

  public getPositions(): any {
    (this.component.circle.configuration as DotGlyphConfiguration).drawAggregate = this.component.configuration.aggregateItems;

    if (!this.component.configuration.aggregateItems) {
      return this.component.data.positions;
    }
    return this.component.configuration.currentLevelOfDetail === 0 && this.component.data.clusterPositions !== undefined
      ? this.component.data.clusterPositions
      : this.component.data.positions;
  }

  public getFeaturesForItem(d: any) {
    const item = this.component.data.features.find(f => {
      return f.id === d.id;
    });
    let itemContext = this.component.configuration.individualFeatureContexts[d.id];
    if (itemContext === undefined) {
      if (this.component.configuration.globalFeatureContext >= 0) {
        itemContext = this.component.configuration.globalFeatureContext;
      } else {
        itemContext = item['default-context'];
      }
    }
    const ret = {
      features: Object.assign(item.features[itemContext], item.features['global']),
      values: item.values
    }
    return ret;
  }
}
