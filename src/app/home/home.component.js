"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
var core_1 = require("@angular/core");
var dataprovider_service_1 = require("../dataprovider.service");
var HomeComponent = (function () {
    function HomeComponent(dataProvider) {
        this.dataProvider = dataProvider;
    }
    HomeComponent.prototype.ngOnInit = function () {
        var _this = this;
        // give everything a chance to get loaded before starting the animation to reduce choppiness
        setTimeout(function () {
            _this.generateData();
            _this.title = _this.dataProvider.getTitle();
            // change the data periodically
            setInterval(function () { return _this.generateData(); }, 10000);
        }, 1000);
    };
    HomeComponent.prototype.generateData = function () {
        this.chartData = [];
        for (var i = 0; i < (8 + Math.floor(Math.random() * 10)); i++) {
            this.chartData.push([
                "Index " + i,
                Math.floor(Math.random() * 100)
            ]);
        }
    };
    return HomeComponent;
}());
HomeComponent = __decorate([
    core_1.Component({
        selector: 'app-home',
        templateUrl: './home.component.html',
        providers: [dataprovider_service_1.DataproviderService],
        styleUrls: ['./home.component.css']
    })
], HomeComponent);
exports.HomeComponent = HomeComponent;
