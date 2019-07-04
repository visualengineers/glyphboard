# Glyphboard

Glyphboard is our approach, to combine dimensionality reduction with a seamless integration of glyph-based visualizations that are able to show the most relevant dimensions in a data set at one glance. To this end, we adopted the visual metaphor of a Big Data Landscape, which is explored by a zoomable user interface. This Glyphboard is an efficient tool to complete low-level and high-level analysis tasks with regards to high-dimensional data.

## Getting Started

![Alt text](glyphboard.png?raw=true "Glyphboard overview with activated split screen")

A demo of Glyphboard is available at  http://glyphboard.mediadesign-tud.de/. The documentation can be found at https://visualengineers.github.io/glyphboard-doc/.

### Install Node 

Download and install [NodeJS](https://nodejs.org/en/download/). Verify that you are running at least node 9.x.x and npm 5.6.x by running `node -v` and `npm -v` in a terminal/console window. Older versions produce errors, but newer versions are fine.

### Install Angular

Download and install command line interface of [Angular.IO](https://angular.io/) via NPM. We are using [Angular CLI](https://github.com/angular/angular-cli) version 6.1.X.

`npm install -g @angular/cli`

### Build and Run

Checkout the [Glyphboard](https://github.com/visualengineers/glyphboard.git) Sourcecode with `--recurse-submodules` as parameter. Only then the backend submodule will be checked out.

Enter directory and run `npm install` and follow the instruction at https://github.com/visualengineers/glyphboard-backend.

Run `npm start` for a dev server inside the project directory. Navigate to `http://localhost:4200/` for the client and `http://localhost:4201/` to test the [backend](https://github.com/visualengineers/glyphboard-backend). The app will automatically reload if you change any of the source files, but you will have to restart manually if you change the python backend.

### FlexiWall Websocket Connection

To use Glyphboard with Elastic Displays, the __FlexiWallController__ class establishes a websocket connection to the tracking server instance (default address: `ws://localhost:8080/`). By default, the controller is disabled. This can be changed by setting the flag  `_isFlexiWallEnabled` in __GlyphplotComponent__. 
