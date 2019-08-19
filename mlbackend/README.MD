# Instructions

All the source code for this prototyp are located at: https://github.com/visualengineers/glyphboard/tree/69-interactive-labeling

## Installing dependencies

### Install python packages (requires pip)

Change directory to `mlbackend` and run `pip install -r requirements.txt`

### Install Node

Download and install [NodeJS](https://nodejs.org/en/download/). Verify that you are running at least node 9.x.x and npm 5.6.x by running `node -v` and `npm -v` in a terminal/console window. Older versions produce errors, but newer versions are fine.

### Install Angular

Download and install command line interface of [Angular.IO](https://angular.io/) via NPM. We are using [Angular CLI](https://github.com/angular/angular-cli) version 6.1.X.

`npm install -g @angular/cli`

## Machine Learning Backend

~~Run `npm run ml`~~ (deprecated)
The ML backend routine is included in the `npm start` script now.

## Jupyter Notebook

Change directory to `mlbackend` and run `jupyter notebook`

## Build and run the app

Run `npm install` to install all node modules.

Run `npm start` for a dev server inside the project directory. Navigate to `http://localhost:4200/` for the client and `http://localhost:4201/` to test the [backend](https://github.com/visualengineers/glyphboard-backend).
