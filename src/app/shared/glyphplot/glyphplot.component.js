"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
var core_1 = require("@angular/core");
var d3 = require("d3");
var ScatterplotComponent = ScatterplotComponent_1 = (function () {
    function ScatterplotComponent() {
        this.margin = { top: 20, bottom: 40, left: 40, right: 20 };
    }
    ScatterplotComponent.prototype.ngOnInit = function () {
        this.createChart();
        if (this.data) {
            this.updateChart();
        }
    };
    ScatterplotComponent.prototype.ngOnChanges = function () {
        if (this.context) {
            //this.updateChart();
        }
    };
    ScatterplotComponent.prototype.createChart = function () {
        var element = this.chartContainer.nativeElement;
        this.width = element.offsetWidth - this.margin.left - this.margin.right;
        this.height = element.offsetHeight - this.margin.top - this.margin.bottom;
        var canvas = d3.select(element).append('canvas')
            .attr('width', this.width)
            .attr('height', this.height)
            .call(d3.zoom().scaleExtent([1, ScatterplotComponent_1.maxZoom]).on('zoom', this.zoomed));
        this.context = canvas[0].getContext('2d');
        this.xAxis = d3.scaleLinear().range([0, this.width]);
        this.yAxis = d3.scaleLinear().range([this.height, 0]);
    };
    ScatterplotComponent.prototype.zoomed = function () {
        this.context.clearRect(0, 0, this.width, this.height);
        this.context(d3.event.transform);
    };
    /**
    * For each entry in the dataset, plot a point a the x and y coordinates
    * relative to the scale of the axes.
    */
    ScatterplotComponent.prototype.plot = function (transform) {
        this.context.clearRect(0, 0, this.width, this.height);
        // context.beginPath();
        this.data.forEach(function (d) { this.drawPoint(d, transform); });
        this.context.fill();
    };
    ScatterplotComponent.prototype.drawPoint = function (d, transform) {
        var tx = transform.applyX(this.xAxis(d.x));
        var ty = transform.applyY(this.yAxis(d.y));
        this.context.beginPath();
        this.context.moveTo(tx, ty);
        this.context.fillStyle = ScatterplotComponent_1.color(d.popularitaet);
        this.context.arc(tx, ty, 3.5, 0, 2 * Math.PI);
        this.context.fill();
    };
    ScatterplotComponent.prototype.updateChart = function () {
    };
    return ScatterplotComponent;
}());
ScatterplotComponent.color = d3.scaleOrdinal(d3.schemeCategory10);
ScatterplotComponent.maxZoom = 15;
__decorate([
    core_1.ViewChild('chart')
], ScatterplotComponent.prototype, "chartContainer");
__decorate([
    core_1.Input()
], ScatterplotComponent.prototype, "data");
ScatterplotComponent = ScatterplotComponent_1 = __decorate([
    core_1.Component({
        selector: 'app-scatterplot',
        templateUrl: './scatterplot.component.html',
        styleUrls: ['./scatterplot.component.css']
    })
], ScatterplotComponent);
exports.ScatterplotComponent = ScatterplotComponent;
var ScatterplotComponent_1;
