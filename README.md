# Glyphboard

[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![LPGL3 License][license-shield]][license-url]

[![Angular Version][angular-shield]][angular-url]
[![D3 Version][d3-shield]][d3-url]
[![Typescript Version][typescript-shield]][typescript-url]

Glyphboard is our approach, to combine dimensionality reduction with a seamless integration of glyph-based visualizations that are able to show the most relevant dimensions in a data set at one glance. To this end, we adopted the visual metaphor of a Big Data Landscape, which is explored by a zoomable user interface. This Glyphboard is an efficient tool to complete low-level and high-level analysis tasks with regards to high-dimensional data.

<sub><sup>From 2016–2019 the development of Glyphboard has been supported by the European Union through the European Regional Development Fund and the
Free State of Saxony, Germany (Visual Analytics Interfaces for Big Data Environments (VANDA) – project no. 100238473).</sup></sub>

![Funding by European Union through the European Regional Development Fund](funding_erdf.png?raw=true)

## Getting Started

![Glyphboard overview with activated split screen](glyphboard.png?raw=true)

A demo of Glyphboard is available at  http://glyphboard.mediadesign-tud.de/. The documentation can be found at https://visualengineers.github.io/glyphboard-doc/.

### Install Node 

Download and install [NodeJS](https://nodejs.org/en/download/). Verify that you are running at least node 14.x.x and npm 6.14.x by running `node -v` and `npm -v` in a terminal/console window. Older versions produce errors, but newer versions are fine.

### Install Angular

Download and install command line interface of [Angular.IO](https://angular.io/) via NPM. We are using [Angular CLI](https://github.com/angular/angular-cli) version 11.0.X.

`npm install -g @angular/cli`

### Build and Run

Checkout the [Glyphboard](https://github.com/visualengineers/glyphboard.git) Sourcecode with `--recurse-submodules` as parameter. Only then the backend submodule will be checked out.

Enter directory and run `npm install` and follow the instruction at https://github.com/visualengineers/glyphboard-backend.

Run `npm start` for a dev server inside the project directory. Navigate to `http://localhost:4200/` for the client and `http://localhost:4201/` to test the [backend](https://github.com/visualengineers/glyphboard-backend). The app will automatically reload if you change any of the source files, but you will have to restart manually if you change the python backend.

### Upgrading from previous versions

Pull newest code from master, then delete `node_modules` folder. Use current Node version, e.g. via NVM and rebuild. Make sure you use the current `package-lock.json` from master.

````
$ git pull
$ rm -rf node_modules
$ git checkout package-lock.json
$ npm install
$ npm start
````

## Deployment via Docker

```
$ cd ~
$ git clone https://github.com/visualengineers/glyphboard --recurse-submodules
$ cd glyphboard
$ ng build --prod
$ docker-compose up --build
```

## Important Developer Links

### D3

* Examples on [ObservableHQ](https://observablehq.com/@d3/)
* Migration Guide on [ObservableHQ](https://observablehq.com/@d3/d3v6-migration-guide)
* Typescript information on [DefinitelyTyped](https://github.com/DefinitelyTyped/DefinitelyTyped)

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[angular-shield]: https://img.shields.io/badge/dynamic/json?color=brightgreen&label=angular&query=%24.dependencies[%27%40angular%2Fcdk%27]&url=https%3A%2F%2Fraw.githubusercontent.com%2Fvisualengineers%2Fglyphboard%2Fmaster%2Fpackage.json&style=for-the-badge
[angular-url]: https://angular.io/
[d3-shield]: https://img.shields.io/badge/dynamic/json?color=brightgreen&label=D3&query=%24.dependencies[%27d3%27]&url=https%3A%2F%2Fraw.githubusercontent.com%2Fvisualengineers%2Fglyphboard%2Fmaster%2Fpackage.json&style=for-the-badge
[d3-url]: https://d3js.org/
[typescript-shield]: https://img.shields.io/badge/dynamic/json?color=brightgreen&label=Typescript&query=%24.devDependencies[%27typescript%27]&url=https%3A%2F%2Fraw.githubusercontent.com%2Fvisualengineers%2Fglyphboard%2Fmaster%2Fpackage.json&style=for-the-badge
[typescript-url]: https://www.typescriptlang.org/
[contributors-shield]: https://img.shields.io/github/contributors/visualengineers/glyphboard.svg?style=for-the-badge
[contributors-url]: https://github.com/visualengineers/glyphboard/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/visualengineers/glyphboard.svg?style=for-the-badge
[forks-url]: https://github.com/visualengineers/glyphboard/network/members
[stars-shield]: https://img.shields.io/github/stars/visualengineers/glyphboard.svg?style=for-the-badge
[stars-url]: https://github.com/visualengineers/glyphboard/stargazers
[issues-shield]: https://img.shields.io/github/issues/visualengineers/glyphboard.svg?style=for-the-badge
[issues-url]: https://github.com/visualengineers/glyphboard/issues
[license-shield]: https://img.shields.io/github/license/visualengineers/glyphboard.svg?style=for-the-badge
[license-url]: https://raw.githubusercontent.com/visualengineers/glyphboard/master/LICENSE
