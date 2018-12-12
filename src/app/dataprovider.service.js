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
var DataproviderService = (function () {
    function DataproviderService() {
    }
    DataproviderService.prototype.getTitle = function () {
        return "Hello World";
    };
    DataproviderService.prototype.getDataFromCsv = function () {
        d3.csv('./data/t-snePos.csv')
            .row(function (d) {
            d.titel = +d.titel;
            d.preis = +d.preis;
            d.entfernung = +d.entfernung;
            d.tage = +d.tage;
            d.musicEstimate = +d.musicEstimate;
            d.popularitaet = +d.popularitaet;
            return d;
        }).get(function (error, data) {
            this.data = data;
        });
    };
    return DataproviderService;
}());
DataproviderService = __decorate([
    core_1.Injectable()
], DataproviderService);
exports.DataproviderService = DataproviderService;
