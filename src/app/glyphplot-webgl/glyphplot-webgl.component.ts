import { Component, OnInit, ElementRef, ViewChild, HostListener, OnChanges, AfterViewInit } from '@angular/core';
import { RegionManager } from 'app/region/region.manager';
import { Input } from '@angular/core';
import { IdFilter } from 'app/shared/filter/id-filter';
import { FeatureFilter } from 'app/shared/filter/feature-filter';
import { LenseCursor } from './../lense/cursor.service';
import {TooltipComponent} from 'app/tooltip/tooltip.component';

import {Configuration } from 'app/shared/services/configuration.service';
import {ConfigurationData} from 'app/shared/services/configuration.data';
import {EventAggregatorService} from 'app/shared/events/event-aggregator.service';
import { Logger } from 'app/shared/services/logger.service';

import * as THREE from 'three';
import { RefreshPlotEvent } from 'app/shared/events/refresh-plot.event';
import { RefreshHoverEvent } from 'app/shared/events/refresh-hover.event';
import { RefreshHoverEventData } from 'app/shared/events/refresh-hover.event.data';
import { ViewportTransformationEvent } from 'app/shared/events/viewport-transformation.event';
import { ViewportTransformationEventData } from 'app/shared/events/viewport-transformation.event.data';
import { InteractionEvent} from 'app/shared/events/interaction.event';
import { InteractionEventData} from 'app/shared/events/interaction.event.data';
import { Interaction} from 'app/shared/util/interaction';

import { GlyphLayout } from 'app/glyph/glyph.layout';
import { SelectionRect } from 'app/glyphplot/selection-rect';
import { Helper } from 'app/glyph/glyph.helper';
import { UpdateItemsStrategy } from 'app/shared/util/UpdateItemsStrategy';
import { FitToSelectionEvent } from 'app/shared/events/fit-to-selection.event';
import { Vector2 } from 'three';
import { CameraSyncUtilities } from 'app/shared/util/cameraSyncUtilities';
import { shiftInitState } from '@angular/core/src/view';

@Component({
  selector: 'app-glyphplot-webgl',
  templateUrl: './glyphplot-webgl.component.html',
  styleUrls: ['./glyphplot-webgl.component.scss']
})

export class GlyphplotWebglComponent implements OnInit, OnChanges, AfterViewInit {
  @Input() width: number;
  @Input() height: number;

  @ViewChild('selectionrectangle') public selectionRectangle: ElementRef;
  @ViewChild('tooltip') public tooltip: TooltipComponent;

  private renderer: THREE.WebGLRenderer;
  private camera: THREE.OrthographicCamera;
  private cameraTarget: THREE.Vector3;
  public scene: THREE.Scene;

  public fieldOfView = 60;
  public nearClippingPane = 1;
  public farClippingPane = 1100;

  private cube: THREE.Mesh[] = [];
  private group: THREE.Group;

  private _configuration: ConfigurationData;
  private _data: any;
  private _particleSystem: THREE.Points;

  private _interactionEvent: Interaction;
  private _interaction: InteractionEventData = new InteractionEventData(null);
  private _transformation: ViewportTransformationEventData = new ViewportTransformationEventData();
  private _cameraUtil: CameraSyncUtilities;

  private _selectionRect: SelectionRect;
  private _context: any;

  //event controller
  private counter: number;
  private selectionEnded: boolean;
  private saveEndTransform = { x: 0, y: 0 };
  private saveStartTransform = { x: 0, y: 0 };
  private _isDraggingActive: boolean = false;

  //tooltip
  private _isOverTooltip: boolean;

  private _shaderDiskMaterial: THREE.ShaderMaterial = new THREE.ShaderMaterial( {
    blending: THREE.NormalBlending,
    depthTest: false,
    transparent: true,
    vertexColors: THREE.VertexColors,
    side: THREE.BackSide
  } );

  private _particleGeometry: THREE.BufferGeometry = new THREE.BufferGeometry();

  @ViewChild('threejscanvas')
  private canvasRef: ElementRef

  public manager;

  constructor(
    private logger: Logger,
    private helper: Helper,
    private regionManager: RegionManager,
    private configurationService: Configuration,
    private eventAggregator: EventAggregatorService,
    private cursor: LenseCursor,
  ) {
    const fl = new THREE.FileLoader();
    fl.load('/assets/shader/glyphplot_vertex.vert', vertexShader => {
      this._shaderDiskMaterial.vertexShader = vertexShader as string
    });
    fl.load('/assets/shader/glyphplot_fragment.frag', fragmentShader => {
      this._shaderDiskMaterial.fragmentShader = fragmentShader as string
    });

    this.configurationService.configurations[0].getData().subscribe(message => {
      if (message != null) {
        this._data = message;
        this.buildParticles();
      }
    });

    this._configuration = this.configurationService.configurations[0];
    this.eventAggregator.getEvent(RefreshPlotEvent).subscribe(this.onRefreshPlot);
    this.eventAggregator.getEvent(RefreshHoverEvent).subscribe(this.onRefreshHover);
    this.eventAggregator.getEvent(ViewportTransformationEvent).subscribe(this.onViewportTransformationUpdated);
    this.eventAggregator.getEvent(InteractionEvent).subscribe(this.onInteractionUpdated);
    this.eventAggregator.getEvent(FitToSelectionEvent).subscribe(this.fitToSelection);
  }

  ngOnInit(): void {
    this.manager = this.regionManager;
  }

  ngOnChanges(): void {
    this.buildParticles();
    this.setViewFrustum();
  }

  ngAfterViewInit() {
    this.createScene();
    this.createLight();
    this.createCamera();
    this.startRendering();

    this.setViewFrustum();

    this._context = this.selectionRectangle.nativeElement.getContext('2d');

    this._selectionRect = new SelectionRect(this, this._context, this.helper);
    this._selectionRect.data = this._data;
    this._selectionRect.offset = {
      x: this.configuration.leftSide ? 0 : window.innerWidth - this.width,
      y: 0
    };

    this.tooltip.data = this._data;

    //todo refactor listener?
    this.tooltip.tooltipElement.addEventListener('mouseover', this.onHoverTooltip);
    this.tooltip.tooltipElement.addEventListener('mouseout', this.onEndHoverTooltip);
  }

  private createScene() {
    this.scene = new THREE.Scene();
    this.scene.add(new THREE.AxesHelper(200));
  }

  private createLight() {
    const light = new THREE.PointLight(0xFFFFFF, 1, 1000);
    light.position.set(0, 0, 100);
    this.scene.add(light);
  }

  private createCamera() {

    const aspectRatio = this.getAspectRatio();
    this.camera = new THREE.OrthographicCamera(this.width / -2, this.width / 2, this.height / -2, this.height / 2);

    // Set position and look at
    this.camera.position.x = 0;
    this.camera.position.y = 0;
    this.camera.position.z = 100;

    this.camera.lookAt(0, 0, 0);
  }

  private getAspectRatio(): number {

      const height = this.height;
      if (height === 0) {
          return 0;
      }

      return this.width / this.height;
  }

  private getScale(): number {
    return 1.0 / (this.width / (this.camera.bottom - this.camera.top));
  }

  private startRendering() {

    this.renderer = new THREE.WebGLRenderer({
        canvas: this.canvas,
        antialias: true
    });

    this.renderer.setPixelRatio(devicePixelRatio);
    this.renderer.setSize(this.width, this.height);
    this.renderer.shadowMap.enabled = false;
    this.renderer.setClearColor(0xEEEEEE, 1);
    this.scene.background = new THREE.Color( 0xEEEEEE );
    this.renderer.autoClear = true;

    this.buildParticles();

    requestAnimationFrame(this.render);
  }

  public render = () => {
    if (!this.regionManager.IsWebGlActive()) {
      return;
   }

    this.renderer.render( this.scene, this.camera );

  }

  //#region HostListeners
  @HostListener('document:mousedown', ['$event'])
  onMousedown(e: MouseEvent){
    this._isDraggingActive = false;
    this._interactionEvent = Interaction.TouchBegin;
    const data = new InteractionEventData(this._interactionEvent, 
      e.offsetX, e.offsetY);
    this.eventAggregator.getEvent(InteractionEvent).publish(data);

    //tooltip
    if (this.tooltip.isVisible && !this.tooltip.isFixed) {
      this.tooltip.isFixed = true;
    } else if (!this.tooltip.isEdit) {
      if(this._isOverTooltip == false){
        this.tooltip.isFixed = false;
      }
    }
  }

  @HostListener('document:mouseup', ['$event'])
  onMouseUp(e: MouseEvent){
    this._interactionEvent = Interaction.TouchEnd;
    const data = new InteractionEventData(this._interactionEvent, 
      e.offsetX, e.offsetY);
    this.eventAggregator.getEvent(InteractionEvent).publish(data);
    this._isDraggingActive = false;
  }
 
  @HostListener('mousemove', ['$event'])
  mouseMove(e: MouseEvent) {
    //set id of hovered glyph and find glyph to highlight
    let glyphRadius: number = 5;
    if (this.configurationService.configurations[0].selectedDataSetInfo.name ===
      this.configurationService.configurations[1].selectedDataSetInfo.name) {
      this.configurationService.configurations[0].idOfHoveredGlyph = undefined;
      this.configurationService.configurations[1].idOfHoveredGlyph = undefined;
    } else {
      this.configuration.idOfHoveredGlyph = undefined;
    }
    for (const element of this.data.positions) {
      if (
        Math.abs(element.position.x - e.layerX) <= glyphRadius &&
        Math.abs(element.position.y - e.layerY) <= glyphRadius
      ) {
        if (this.configurationService.configurations[0].selectedDataSetInfo.name ===
          this.configurationService.configurations[1].selectedDataSetInfo.name) {
          this.configurationService.configurations[0].idOfHoveredGlyph = element.id;
          this.configurationService.configurations[1].idOfHoveredGlyph = element.id;
        } else {
          this.configuration.idOfHoveredGlyph = element.id;
        }
        break;
      }
    }

    if (e.buttons === 1) {
      if (!this.configuration.useDragSelection) {
        const scale = this._transformation.GetScale();
        const translateX = this._transformation.GetTranslateX() + (-e.movementX / scale)
        const translateY = this._transformation.GetTranslateY() + (-e.movementY / scale);

        const data = new ViewportTransformationEventData(translateX, translateY, 0, scale, UpdateItemsStrategy.DefaultUpdate,
          this._transformation.GetZoomViewportOffsetX(),
          this._transformation.GetZoomViewportOffsetY(),
          this._transformation.GetZoomViewportOffsetZ(),
          this._transformation.GetZoomCursorOffsetX(),
          this._transformation.GetZoomCursorOffsetY(),
          this._transformation.GetZoomCursorOffsetZ());
        this.eventAggregator.getEvent(ViewportTransformationEvent).publish(data);

      } else {
        this._isDraggingActive = true;
        this._interactionEvent = Interaction.Drag;
        const data = new InteractionEventData(this._interactionEvent,
          e.offsetX, e.offsetY);
        this.eventAggregator.getEvent(InteractionEvent).publish(data);
      }
    }

    //mouse movement for magic lens
    if (this.cursor.isVisible && !this.cursor.isFixed) {
      this.cursor.position = { left: e.clientX, top: e.clientY };
      this.tooltip.isVisible = false;
    } 
    //show tooltip when hovering
    else if (!this.tooltip.isFixed && !this.configuration.useDragSelection) {
      if (this.tooltip.data == null) {
        this.tooltip.data = this._data;
      }
      this.tooltip.updateClosestPoint(e, this._transformation);
    } 
    //hide tooltip when point was clicked
    else if (!this.tooltip.isFixed) {
      this.tooltip.isVisible = false;
    }
  }

  @HostListener('document:keydown', ['$event'])
  onKeyDown(e: KeyboardEvent) {
    if (e.key === ' ') {
      console.log('reset View...');
      this.resetView();
    }
  }

  private resetView(): void {
  this.camera.position.set(0, 0, 100);
  this._transformation = new ViewportTransformationEventData();
  }

  @HostListener('wheel', ['$event'])
  mousewheel(e: WheelEvent) {
    //if tooltip is active disable zooming
    //TODO: disable zooming only when hovering over tooltip
    if (this.tooltip.isFixed || this._cameraUtil === undefined){
      return;
    }

    const wheelDelta = e.deltaY < 0 ? 1 : -1;

    let zoom = this._transformation.GetScale();
    const change = wheelDelta * 0.1;

    zoom += change;

    if (zoom < 0.1) {
      zoom = 0.1;
    }

    const camSizeX = this.camera.right - this.camera.left; //  + (this._transformation.GetZoomCursorOffsetX() - this._transformation.GetTranslateX());
    const camSizeY = this.camera.bottom - this.camera.top; // + (this._transformation.GetZoomCursorOffsetY() - this._transformation.GetTranslateY());

    const camSizeOriginalX = (this._cameraUtil.DataMax.x - this._cameraUtil.DataMin.x) * this._cameraUtil.DataScale.x;
    const camSizeOriginalY = (this._cameraUtil.DataMax.y - this._cameraUtil.DataMin.y) * this._cameraUtil.DataScale.y;

    const centerVpX = this.width * 0.5;
    const centerVpY = this.height * 0.5;

    const zfX =  camSizeX / camSizeOriginalX;
    const zfY = camSizeY / camSizeOriginalY;

    console.log('zfx: ' + zfX);

    // const normMouse = new THREE.Vector2(
    //   ((e.clientX - centerVpX)  / (this.width)),
    //   ((e.clientY - centerVpY) / (this.height))
    // );

    const normMouse = new THREE.Vector2(0, 0);

   const offsets = this._cameraUtil.ComputeZoomOffset(zoom, normMouse);

   const data = new ViewportTransformationEventData(
    this._transformation.GetTranslateX(),
    this._transformation.GetTranslateY(),
    this._transformation.GetTranslateZ(), zoom,
    UpdateItemsStrategy.DefaultUpdate,
    offsets.ViewportScaleOffset.x,
    offsets.ViewportScaleOffset.y, 0,
    offsets.CursorOffset.x,
    offsets.CursorOffset.y, 0);

    this.eventAggregator.getEvent(ViewportTransformationEvent).publish(data);
  }

  @HostListener('window:resize', ['$event'])
  public onResize(event: Event) {
    this.setViewFrustum();
  }

  //#endregion HostListeners


  private setViewFrustum(): void {
    if (this.camera === null || this._cameraUtil === undefined) {
      return;
    }

    const dataMin = this._cameraUtil.DataMin;
    const dataMax = this._cameraUtil.DataMax;
    const dataScale = this._cameraUtil.DataScale;

    this.camera.left = dataMin.x * dataScale.x + this._transformation.GetZoomViewportOffsetX() + this._transformation.GetZoomCursorOffsetX() + this._transformation.GetTranslateX();
    this.camera.right = dataMax.x * dataScale.x - this._transformation.GetZoomViewportOffsetX() + this._transformation.GetZoomCursorOffsetX() + this._transformation.GetTranslateX();
    this.camera.top = dataMin.y * dataScale.y + this._transformation.GetZoomViewportOffsetY() + this._transformation.GetZoomCursorOffsetY() + this._transformation.GetTranslateY();
    this.camera.bottom = dataMax.y * dataScale.y - this._transformation.GetZoomViewportOffsetY() + this._transformation.GetZoomCursorOffsetY() + this._transformation.GetTranslateY();

    this.camera.updateProjectionMatrix();

    this.renderer.setSize(this.width, this.height);

    this.render();
  }

  private buildParticles() {
    this._shaderDiskMaterial.extensions.derivatives = true;

    if (this._particleSystem) {
       this.scene.remove(this._particleSystem);
       this._particleSystem = null;
    }

    const particlePositions = [];
    const particleColors = [];
    const particleSizes = [];

    let dataMinX, dataMinY, dataMaxX, dataMaxY = 0;

    if (this.data != null) {
      dataMinX = this.data.positions[0].position.ox;
      dataMaxX = this.data.positions[0].position.ox;

      dataMinY = this.data.positions[0].position.oy;
      dataMaxY = this.data.positions[0].position.oy;

      const colorFeature = this.data.schema.color;
      const colorScale = item => {
        return item === undefined
          ? 0
          : this._configuration.color(+item[colorFeature]);
      };

      // let first = true;

      // step 1: find min, max values
      this.data.positions.forEach(item => {
        const pX = item.position.ox;
        const pY = item.position.oy;
        const pZ = -10;

        if (pX < dataMinX) {
          dataMinX = pX;
        }

        if (pY < dataMinY) {
          dataMinY = pY;
        }

        if (pX > dataMaxX ) {
          dataMaxX  = pX;
        }

        if (pY > dataMaxY) {
          dataMaxY = pY;
        }
      });

      // add 5% border
      const borderX = (dataMaxX - dataMinX) / 20;
      const borderY = (dataMaxY - dataMinY) / 20;

      // adjust drawing range
      dataMinX -= borderX;
      dataMaxX += borderX;

      dataMinY -= borderY;
      dataMaxY += borderY;

      // step 2: compute scale to fit into screen space (simlar to glyphplot.layout.controller.updatePositions())
      const dataDomainX = (dataMaxX) - (dataMinX);
      const dataDomainY = (dataMaxY) - (dataMinY);

      const renderRangeX = this.width;
      const renderRangeY = this.height;

      const dataScaleX = renderRangeX / dataDomainX;
      const dataScaleY = renderRangeY / dataDomainY;

      this._cameraUtil = new CameraSyncUtilities(
        new THREE.Vector2(dataMinX, dataMinY),
        new THREE.Vector2(dataMaxX, dataMaxY),
        new THREE.Vector2(dataScaleX, dataScaleY));

      // step 3: push window-scaled positions
      this.data.positions.forEach(item => {
        const renderPosX = (item.position.ox * dataScaleX);
        const renderPosY = (((dataMaxY - item.position.oy) + dataMinY) * dataScaleY);
        const renderPosZ = -10;

        particlePositions.push(renderPosX);
        particlePositions.push(renderPosY);
        particlePositions.push(renderPosZ);

        const isPassive =
          !((this._configuration.filteredItemsIds.indexOf(item.id) > -1) ||
          (this._configuration.featureFilters.length === 0));

        const feature = this.configuration.getFeaturesForItem(item).features;
        const color = isPassive ? new THREE.Color('#ccc') : new THREE.Color(colorScale(feature));
        particleColors.push( color.r, color.g, color.b);

        particleSizes.push(10);
      });

      this.setViewFrustum();

      this._particleGeometry.addAttribute( 'position', new THREE.Float32BufferAttribute( particlePositions, 3 ) );
      this._particleGeometry.addAttribute( 'color', new THREE.Float32BufferAttribute( particleColors, 3 ) );
      this._particleGeometry.addAttribute( 'size', new THREE.Float32BufferAttribute( particleSizes, 1 ) );

      this._particleSystem = new THREE.Points(
        this._particleGeometry,
        this._shaderDiskMaterial);

       this._particleSystem.frustumCulled = false;

      // add it to the scene
      this.scene.add(this._particleSystem);

      this.render();
    }
  }

  //#region SubscribedEvents
  private onRefreshPlot = (payload: boolean) => {
    if (this.data == null) {
      return;
    }
    this._configuration = this.configurationService.configurations[0];
    this.updateParticles();
  }

  private onViewportTransformationUpdated = (payload: ViewportTransformationEventData) => {
    if (!(this instanceof(GlyphplotWebglComponent))) {
      return;
    }

    this._transformation = payload;
    this.setViewFrustum();
  }

  private fitToSelection = (payload: boolean) => {
    const filteredPositions = [];
    this.data.getPositions().forEach(d => {
      const data = this.configuration.getFeaturesForItem(d);

        if (this.configuration.filteredItemsIds.indexOf(d.id) > -1 || this.configuration.featureFilters.length === 0) {
          filteredPositions.push(d.position);
        }
      });
    if (filteredPositions.length === this._data.getPositions().length || filteredPositions.length === 0) {
      return;
    }
    let minX, maxX, minY, maxY: number;
    minX = filteredPositions[0].x;
    maxX = filteredPositions[0].x;
    minY = filteredPositions[0].y;
    maxY = filteredPositions[0].y;
    filteredPositions.forEach( d => {
        if (d.x < minX) {
          minX = d.x;
        }
        if (d.x > maxX) {
          maxX = d.x;
        }
        if (d.y < minY) {
          minY = d.y;
        }
        if (d.y > maxY) {
          maxY = d.y;
        }
    });


    const transX = ((maxX + minX) / 2);
    const transY = ((maxY + minY) / 2);

    console.log('Fit to selection transformation: X = ' + transX + ', Y: ' + transY + ', Zoom: ');

    const args = new ViewportTransformationEventData(minX, minY, 0, 100, UpdateItemsStrategy.DefaultUpdate);

    this.eventAggregator.getEvent(ViewportTransformationEvent).publish(args);

  };

  private onInteractionUpdated = (payload: InteractionEventData) => {
    // TODO
    var interaction : Interaction  = payload.GetInteractionEvent();
    switch(interaction){
      case Interaction.TouchBegin: {
        if (this.selectionEnded) {
          this.saveStartTransform = {x: payload.GetPositionX(), y: payload.GetPositionY()};
        }
    
        this.counter = 0;
    
        if (!this.configuration.useDragSelection) {
          this.configuration.currentLayout = GlyphLayout.Cluster;
          return;
        }
    
        this.selectionEnded = false;
        const startX: number = payload.GetPositionX();
        const startY: number = payload.GetPositionY();
        this._selectionRect.start = { x: startX, y: startY };
        break;
      }
      case Interaction.TouchEnd: {
        //touchend vs dragend
        if(!this._isDraggingActive)
          return;

        if(!this.configuration.useDragSelection)
          return;
          
        this.saveEndTransform = {x: payload.GetPositionX(), y: payload.GetPositionY()};

        this._selectionRect.clear();
        this._selectionRect.data = this.data;
    
        const existingIdFilters: FeatureFilter[] = this.configuration.featureFilters.filter((filter: FeatureFilter) => {
          if (filter instanceof IdFilter) {
            return true;
          }
        });
    
        const selection = this._selectionRect.selectedGlyphs;
        const selectedIds: number[] = selection.positions.reduce((arrayOfIds: number[], item: any) => {
          arrayOfIds.push(item.id);
          return arrayOfIds;
        }, []);
    
        this.clearIdFilters();
    
        // filter only if at least one glyph was selected
        if (selectedIds.length > 0) {
          let idFilter: IdFilter;
    
          if (this.configuration.extendSelection && existingIdFilters.length > 0) {
            const existingFilter = existingIdFilters[0];
            if (existingFilter instanceof IdFilter) {
              idFilter = existingFilter;
            }
            idFilter.extendAccaptableIds(selectedIds);
          } else {
            idFilter = new IdFilter('id', selectedIds);
          }
          if (this.viewsShowTheSameDataSet()) {
            this.configurationService.configurations[0].featureFilters.push(idFilter);
            this.configurationService.configurations[1].featureFilters.push(idFilter);
            this.configurationService.configurations[0].filterRefresh();
            this.configurationService.configurations[1].filterRefresh();
          } else {
            this.configuration.featureFilters.push(idFilter);
            this.configuration.filterRefresh();
          }
        }
        // draws the selection rectangle if the user is currently in the specific mode
        if (this.configuration.useDragSelection) {
          this._selectionRect.drawWebGl(payload);
        }
        this.eventAggregator.getEvent(RefreshPlotEvent).publish(true);
        this._selectionRect.clear();
        break;
      }
      case Interaction.Drag: {
        this.selectionEnded = true;
        if (this.configuration.useDragSelection){
          // draw rectangle and lock camera
          this._selectionRect.drawWebGl(payload);
        }
        break;
      }
    }
  }

  private viewsShowTheSameDataSet(): boolean {
    return this.configurationService.configurations[0].selectedDataSetInfo.name ===
      this.configurationService.configurations[1].selectedDataSetInfo.name;
  }

  private onRefreshHover = (payload: RefreshHoverEventData) => {
    if(this.regionManager.IsD3Active())
      return;
      //show pulse effect
      if (this._configuration.useDragSelection) {
        this._selectionRect.drawHighlightedGlyph();
      }
  }
  //#endregion SubscribedEvents

  private clearIdFilters() {
    function removeIdFilters(filter: FeatureFilter, index: number, featureFilters: FeatureFilter[]) {
      if (filter instanceof IdFilter) {
        featureFilters.splice(index, 1);
      }
    }
    // remove old idFilters
    this.configuration.featureFilters.forEach(removeIdFilters);
  }

  private updateParticles() {
    const colorFeature = this.data.schema.color;
    const configuration = this.configurationService.configurations[0];
    const colorScale = item => {
      return item === undefined
        ? 0
        : this._configuration.color(+item[colorFeature]);
    };

    const particleColors = [];

    this.data.positions.forEach(item => {
      const isPassive =
            !((this._configuration.filteredItemsIds.indexOf(item.id) > -1) ||
            (this._configuration.featureFilters.length === 0));
          const feature = this.configuration.getFeaturesForItem(item).features;
          const color = isPassive ? new THREE.Color('#ccc') : new THREE.Color(colorScale(feature));
          particleColors.push( color.r, color.g, color.b);
    });

    this._particleGeometry.addAttribute( 'color', new THREE.Float32BufferAttribute( particleColors, 3 ) );
    this.render();
  }

  //#region Tooltip
  private onHoverTooltip = () =>{
    this.isOverTooltip = true;
  }

  private onEndHoverTooltip = () =>{
    this.isOverTooltip = false;
  }
  //#endregion Tooltip

  //#region getters and setters
  get configuration() { return this._configuration; }
  set configuration(value: ConfigurationData) { this._configuration = value; }
  get data(): any {
    return this._data;
  }
  set data(value: any) {
    this._data = value;
  }
  private get canvas(): HTMLCanvasElement {
    return this.canvasRef.nativeElement;
  }
  get isOverTooltip(): boolean {
    return this._isOverTooltip;
  }
  set isOverTooltip(value: boolean) {
    this._isOverTooltip = value;
  }
  //#endregion
}
