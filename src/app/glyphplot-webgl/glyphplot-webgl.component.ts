import { Component, OnInit, ElementRef, ViewChild, HostListener, OnChanges, AfterViewInit } from '@angular/core';
import { RegionManager } from 'app/region/region.manager';
import { Input } from '@angular/core';
import { IdFilter } from 'app/shared/filter/id-filter';
import { FeatureFilter } from 'app/shared/filter/feature-filter';

import {Configuration } from 'app/shared/services/configuration.service';
import {ConfigurationData} from 'app/shared/services/configuration.data';
import {EventAggregatorService} from 'app/shared/events/event-aggregator.service';
import { Logger } from 'app/shared/services/logger.service';

import * as THREE from 'three';
import { ShadowMaterial, Color, BufferGeometry, Camera } from 'three';
import { RefreshPlotEvent } from 'app/shared/events/refresh-plot.event';
import { ViewportTransformationEvent } from 'app/shared/events/viewport-transformation.event';
import { ViewportTransformationEventData } from 'app/shared/events/viewport-transformation.event.data';
import { InteractionEvent} from 'app/shared/events/interaction.event';
import { InteractionEventData} from 'app/shared/events/interaction.event.data';
import { Interaction} from 'app/shared/util/interaction';

import { SelectionRect } from 'app/glyphplot/selection-rect';
import { Helper } from 'app/glyph/glyph.helper';

@Component({
  selector: 'app-glyphplot-webgl',
  templateUrl: './glyphplot-webgl.component.html',
  styleUrls: ['./glyphplot-webgl.component.scss']
})

export class GlyphplotWebglComponent implements OnInit, OnChanges, AfterViewInit {
  @Input() width: number;
  @Input() height: number;

  @ViewChild('selectionrectangle') public selectionRectangle: ElementRef;

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

  private _data_MinX: number;
  private _data_MaxX: number;
  private _data_MinY: number;
  private _data_MaxY: number;

  private _interactionEvent: Interaction;
  private _interaction: InteractionEventData = new InteractionEventData(null);
  private _transformation: ViewportTransformationEventData = new ViewportTransformationEventData();

  private _selectionRect: SelectionRect;
  private _context: any;

  private _shaderMaterial: THREE.ShaderMaterial = new THREE.ShaderMaterial( {
    vertexShader: 'attribute float size; varying vec3 vColor; void main() { vColor = color; vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 ); gl_PointSize = size; gl_Position = projectionMatrix * mvPosition; }',
    fragmentShader: 'varying vec3 vColor; void main() { gl_FragColor = vec4( vColor, 1.0 ); }',

    blending: THREE.NoBlending,
    depthTest: false,
    transparent: false,
    vertexColors: THREE.VertexColors
  } );

  private _shaderDiskMaterial: THREE.ShaderMaterial = new THREE.ShaderMaterial( {
    vertexShader: "attribute float size; varying vec3 vColor; void main() { vColor = color; vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 ); gl_PointSize = size; gl_Position = projectionMatrix * mvPosition; }",
    fragmentShader: "varying  vec3 vColor; void main(){float r = 0.0, delta = 0.0, alpha = 1.0; vec2 cxy = 2.0 * gl_PointCoord - 1.0; r = dot(cxy, cxy); delta = fwidth(r); alpha = 1.0 - smoothstep(0.5 - delta, 0.5 + delta, r); gl_FragColor = vec4(vColor, alpha);}",    
    blending: THREE.NormalBlending,   
    depthTest: false,    
    transparent: true,    
    vertexColors: THREE.VertexColors
  } );

  private _particleGeometry: THREE.BufferGeometry = new THREE.BufferGeometry();

  @ViewChild('threejscanvas')
  private canvasRef: ElementRef

  public manager;

  constructor(
    private logger: Logger,
    private helper: Helper,
    public regionManager: RegionManager,
    private configurationService: Configuration,
    private eventAggregator: EventAggregatorService
  ) {
    this.configurationService.configurations[0].getData().subscribe(message => {
      if (message != null) {
        this._data = message;
        console.log("msg" + message);
        this.buildParticles();
      }
    });
    console.log("msg" );
    this._configuration = this.configurationService.configurations[0];
    this.eventAggregator.getEvent(RefreshPlotEvent).subscribe(this.onRefreshPlot);

    this.eventAggregator.getEvent(ViewportTransformationEvent).subscribe(this.onViewportTransformationUpdated);
    this.eventAggregator.getEvent(InteractionEvent).subscribe(this.onInteractionUpdated);

    this.render = this.render.bind(this);
  }

  ngOnInit(): void {
    this.manager = this.regionManager;
  }

  ngOnChanges(): void {
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
    this._selectionRect.data = this.data;
    this._selectionRect.offset = {
      x: this.configuration.leftSide ? 0 : window.innerWidth - this.width,
      y: 0
    };
  }

  private get canvas(): HTMLCanvasElement {
    return this.canvasRef.nativeElement;
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
    this.camera.position.z = -100;
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
    this.renderer.setClearColor(0xFFFFFF, 1);
    this.renderer.autoClear = true;

    this.buildParticles();

    const component: GlyphplotWebglComponent = this;

    (function render() {
        component.render();
    }());
  }

  public render() {

    const self: GlyphplotWebglComponent = this;

    (function render() {
      requestAnimationFrame(render);

      self.renderer.render( self.scene, self.camera );

    }());

    this.renderer.render(this.scene, this.camera);
    this.scene.background = new THREE.Color( 0xFFFFFF );
  }

   //#region HostListeners
  @HostListener('document:mousedown', ['$event'])
  onMousedown(e: MouseEvent){
    this._interactionEvent = Interaction.TouchBegin;
    const data = new InteractionEventData(this._interactionEvent, 
      e.offsetX, e.offsetY);
    this.eventAggregator.getEvent(InteractionEvent).publish(data);
  }

  @HostListener('document:mouseup', ['$event'])
  onMouseUp(e: MouseEvent){
    this._interactionEvent = Interaction.TouchEnd;
    const data = new InteractionEventData(this._interactionEvent, 
      e.offsetX, e.offsetY);
    this.eventAggregator.getEvent(InteractionEvent).publish(data);
  }
 
  @HostListener('mousemove', ['$event'])
  mouseMove(e: MouseEvent) {
    if (e.buttons === 1) {
      if(!this.configuration.useDragSelection){
        const position = this.camera.position;
        const scale = this._transformation.GetScale();
        const translateX = position.x + (-e.movementX / scale)
        const translateY = position.y + (-e.movementY / scale);

        const data = new ViewportTransformationEventData(translateX, translateY, 0, scale);
        this.eventAggregator.getEvent(ViewportTransformationEvent).publish(data);

      } else {
        this._interactionEvent = Interaction.Drag;
        const data = new InteractionEventData(this._interactionEvent,
          e.offsetX, e.offsetY);
        this.eventAggregator.getEvent(InteractionEvent).publish(data);
      }
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

  @HostListener('mousewheel', ['$event'])
  mousewheel(e: WheelEvent) {
    const wheelDelta = e.deltaY / -100;

    let zoom = this._transformation.GetScale();
    const change = wheelDelta * 0.1;

    zoom += change;

    if (zoom < 0.1) {
      zoom = 0.1; }

    const data = new ViewportTransformationEventData(
      this._transformation.GetTranslateX(), this._transformation.GetTranslateY(), this._transformation.GetTranslateZ(), zoom);

    this.eventAggregator.getEvent(ViewportTransformationEvent).publish(data);
  }

  @HostListener('window:resize', ['$event'])
  public onResize(event: Event) {
    this.setViewFrustum();
  }

  private setViewFrustum(): void {
    if (this.camera == null) {
      return;
    }

    const aspect = this.getAspectRatio();

    this.camera.left = this._data_MinX / this._transformation.GetScale();
    this.camera.right = this._data_MaxX / this._transformation.GetScale();
    this.camera.top = (this._data_MinY / this._transformation.GetScale());
    this.camera.bottom = (this._data_MaxY / this._transformation.GetScale());

    this.camera.position.setX(this._transformation.GetTranslateX());
    this.camera.position.setY(this._transformation.GetTranslateY());

    this.camera.updateProjectionMatrix();

    this.renderer.setSize(this.width, this.height);

    this.render();
  }

  private buildParticles() {
    this._shaderDiskMaterial.extensions.derivatives = true;

    this.setViewFrustum();

    if (this._particleSystem) {
       this.scene.remove(this._particleSystem);
       this._particleSystem = null;
    }

    const particlePositions = [];
    const particleColors = [];
    const particleSizes = [];

    if (this.data != null) {
      this._data_MinX = 0;
      this._data_MaxX = 0;

      this._data_MinY = 0;
      this._data_MaxY = 0;

      const colorFeature = this.data.schema.color;
      const colorScale = item => {
        return item === undefined
          ? 0
          : this._configuration.color(+item[colorFeature]);
      };

      this.data.positions.forEach(item => {
        const pX = item.position.x;
        const pY = item.position.y;
        const pZ = -10;

        particlePositions.push(pX);
        particlePositions.push(pY);
        particlePositions.push(pZ);

        const isPassive =
          !((this._configuration.filteredItemsIds.indexOf(item.id) > -1) ||
          (this._configuration.featureFilters.length === 0));

        const feature = this.getFeaturesForItem(item, this._configuration).features;
        const color = isPassive ? new THREE.Color('#ccc') : new THREE.Color(colorScale(feature));
        particleColors.push( color.r, color.g, color.b);

        particleSizes.push(10);

        if (pX < this._data_MinX) {
          this._data_MinX = pX;
        }

        if (pY < this._data_MinY) {
          this._data_MinY = pY;
        }

        if (pX > this._data_MaxX ) {
          this._data_MaxX  = pX;
        }

        if (pY > this._data_MaxY) {
          this._data_MaxY = pY;
        }
      });

      this.setViewFrustum();

      this.resetView();

      console.log('number of particles total: ' + particlePositions.length);

      this._particleGeometry.addAttribute( 'position', new THREE.Float32BufferAttribute( particlePositions, 3 ) );
      this._particleGeometry.addAttribute( 'color', new THREE.Float32BufferAttribute( particleColors, 3 ) );
      this._particleGeometry.addAttribute( 'size', new THREE.Float32BufferAttribute( particleSizes, 1 ) );

      this._particleSystem = new THREE.Points(
        this._particleGeometry,
        this._shaderDiskMaterial);

      // add it to the scene
      this.scene.add(this._particleSystem);
    }
  }

  //#region subscribed events
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

  private onInteractionUpdated = (payload: InteractionEventData) => {
    //TODO
    var interaction : Interaction  = payload.GetInteractionEvent();
    switch(interaction){
      case Interaction.TouchBegin: {
        const startX: number = payload.GetPositionX();
        const startY: number = payload.GetPositionY();
        this._selectionRect.start = { x: startX, y: startY };
        break;
      }
      case Interaction.TouchEnd: {
        if(this.configuration.useDragSelection)
        {
          this._selectionRect.clear();

          if(this.data != null){
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

            // this.clearIdFilters();

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
              this.configuration.featureFilters.push(idFilter);
              this.configuration.filterRefresh();
            }
          }
          this.eventAggregator.getEvent(RefreshPlotEvent).publish(true);
        }
        break;
      }
      case Interaction.Drag: {
        if(this.configuration.useDragSelection){
          //draw rectangle and lock camera
          this._selectionRect.drawWebGl(payload);
        }
        break;
      }
    }
  }
  //#endregions subscribed events

  private clearIdFilters() {
    function removeIdFilters(filter: FeatureFilter, index: number, featureFilters: FeatureFilter[]) {
      if (filter instanceof IdFilter) {
        featureFilters.splice(index, 1);
      }
    }

    // remove old idFilters
      this.configuration.featureFilters.forEach(removeIdFilters);
  }

  private getFeaturesForItem(d: any, config: ConfigurationData) {
    const item = this.data.features.find(f => {
      return f.id === d.id;
    });
    let itemContext = config.individualFeatureContexts[d.id];
    if (itemContext === undefined) {
      if (config.globalFeatureContext >= 0) {
        itemContext = config.globalFeatureContext;
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

  private updateParticles() {
    const colorFeature = this.data.schema.color;
    const configuration = this.configurationService.configurations[0];
    const colorScale = item => {
      return item === undefined
        ? 0
        : this._configuration.color(+item[colorFeature]);
    };

    const particleColors = [];

    this.data.positions.forEach((e: { id: number; }) => {
          const isPassive =
            !((this._configuration.filteredItemsIds.indexOf(e.id) > -1) ||
            (this._configuration.featureFilters.length === 0));
          const feature = this.getFeaturesForItem(e, this._configuration).features;
          const color = isPassive ? new THREE.Color('#ccc') : new THREE.Color(colorScale(feature));
          particleColors.push( color.r, color.g, color.b);
    });
    this._particleGeometry.addAttribute( 'color', new THREE.Float32BufferAttribute( particleColors, 3 ) );
  }

  //#region getters and setters
  get configuration() { return this._configuration; }
  set configuration(value: ConfigurationData) { this._configuration = value; }
  get data(): any {
    return this._data;
  }
  set data(value: any) {
    this._data = value;
  }
  //#endregion
}
