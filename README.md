# Glyphboard

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

## Important Developer Links

### D3

* Examples on [ObservableHQ](https://observablehq.com/@d3/)
* Migration Guide on [ObservableHQ](https://observablehq.com/@d3/d3v6-migration-guide)
* Typescript information on [DefinitelyTyped](https://github.com/DefinitelyTyped/DefinitelyTyped)