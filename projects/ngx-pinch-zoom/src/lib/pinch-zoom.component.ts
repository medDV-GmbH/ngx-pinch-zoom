import {
    Component,
    ElementRef,
    EventEmitter,
    HostBinding,
    Input,
    OnDestroy, OnInit, Output,
    SimpleChanges
} from '@angular/core';

import {MouseZoomPoint, PinchZoomProperties, ZoomEvent} from './interfaces';
import { defaultProperties, backwardCompatibilityProperties } from './properties';
import { IvyPinch } from './ivypinch';

export const _defaultComponentProperties: PinchZoomProperties = {
    overflow: 'hidden',
    disableZoomControl: 'auto',
    backgroundColor: 'rgba(0,0,0,0.85)',
};

type PropertyName = keyof PinchZoomProperties;

@Component({
    selector: 'pinch-zoom, [pinch-zoom]',
    exportAs: 'pinchZoom',
    templateUrl: './pinch-zoom.component.html',
    styleUrls: ['./pinch-zoom.component.sass'],
})
export class PinchZoomComponent implements OnInit, OnDestroy {
    defaultComponentProperties!: PinchZoomProperties;
    private pinchZoom: IvyPinch;
    private _properties!: PinchZoomProperties;
    private zoomControlPositionClass: string | undefined;
    private _transitionDuration!: number;
    private _doubleTap!: boolean;
    private _doubleTapScale!: number;
    private _autoZoomOut!: boolean;
    private _limitZoom!: number | 'original image size';

    @Input('properties') set properties(value: PinchZoomProperties) {
        if (value) {
            this._properties = value;
        }
    }

    get properties() {
        return this._properties;
    }

    // transitionDuration
    @Input('transition-duration') set transitionDurationBackwardCompatibility(value: number) {
        if (value) {
            this._transitionDuration = value;
        }
    }

    @Input('transitionDuration') set transitionDuration(value: number) {
        if (value) {
            this._transitionDuration = value;
        }
    }

    get transitionDuration() {
        return this._transitionDuration;
    }

    // doubleTap
    @Input('double-tap') set doubleTapBackwardCompatibility(value: boolean) {
        if (value) {
            this._doubleTap = value;
        }
    }

    @Input('doubleTap') set doubleTap(value: boolean) {
        if (value) {
            this._doubleTap = value;
        }
    }

    get doubleTap() {
        return this._doubleTap;
    }

    // doubleTapScale
    @Input('double-tap-scale') set doubleTapScaleBackwardCompatibility(value: number) {
        if (value) {
            this._doubleTapScale = value;
        }
    }

    @Input('doubleTapScale') set doubleTapScale(value: number) {
        if (value) {
            this._doubleTapScale = value;
        }
    }

    get doubleTapScale() {
        return this._doubleTapScale;
    }

    // autoZoomOut
    @Input('auto-zoom-out') set autoZoomOutBackwardCompatibility(value: boolean) {
        if (value) {
            this._autoZoomOut = value;
        }
    }

    @Input('autoZoomOut') set autoZoomOut(value: boolean) {
        if (value) {
            this._autoZoomOut = value;
        }
    }

    get autoZoomOut() {
        return this._autoZoomOut;
    }

    // limitZoom
    @Input('limit-zoom') set limitZoomBackwardCompatibility(value: number | 'original image size') {
        if (value) {
            this._limitZoom = value;
        }
    }

    @Input('limitZoom') set limitZoom(value: number | 'original image size') {
        if (value) {
            this._limitZoom = value;
        }
    }

    get limitZoom() {
        return this._limitZoom;
    }

    @Input() disabled!: boolean;
    @Input() disablePan!: boolean;
    @Input() overflow!: 'hidden' | 'visible';
    @Input() zoomControlScale!: number;
    @Input() disableZoomControl!: 'disable' | 'never' | 'auto';
    @Input() backgroundColor!: string;
    @Input() limitPan!: boolean;
    @Input() minPanScale!: number;
    @Input() minScale!: number;
    @Input() listeners!: 'auto' | 'mouse and touch';
    @Input() wheel!: boolean;
    @Input() autoHeight!: boolean;
    @Input() stepZoomFactor!: number;
    @Input() wheelZoomFactor!: number;
    @Input() draggableImage!: boolean;

    @Output() onZoomChange: EventEmitter<ZoomEvent> = new EventEmitter<ZoomEvent>();

    @HostBinding('style.overflow')
    get hostOverflow() {
        return this.properties['overflow'];
    }

    @HostBinding('style.background-color')
    get hostBackgroundColor() {
        return this.properties['backgroundColor'];
    }

    get isTouchScreen() {
        var prefixes = ' -webkit- -moz- -o- -ms- '.split(' ');
        var mq = function (query: any) {
            return window.matchMedia(query).matches;
        };

        if ('ontouchstart' in window) {
            return true;
        }

        // include the 'heartz' as a way to have a non matching MQ to help terminate the join
        // https://git.io/vznFH
        var query = ['(', prefixes.join('touch-enabled),('), 'heartz', ')'].join('');
        return mq(query);
    }

    get isDragging() {
        return this.pinchZoom ? this.pinchZoom.isDragging() : undefined;
    }

    get isDisabled() {
        return this.properties['disabled'];
    }

    get scale() {
        return this.pinchZoom.scale;
    }

    get isZoomedIn() {
        return this.scale > 1;
    }

    get scaleLevel() {
        return Math.round(this.scale / this._zoomControlScale);
    }

    get maxScale() {
        return this.pinchZoom.maxScale;
    }

    get isZoomLimitReached() {
        return this.scale >= this.maxScale;
    }

    get _zoomControlScale() {
        return this.getPropertiesValue('zoomControlScale');
    }

    constructor(private elementRef: ElementRef) {
        this.defaultComponentProperties = this.getDefaultComponentProperties();
        this.applyPropertiesDefault(this.defaultComponentProperties, {});
    }

    ngOnInit() {
        this.initPinchZoom();

        /* Calls the method until the image size is available */
        this.detectLimitZoom();
    }

    isControl() {
        if (this.isDisabled) {
            return false;
        }

        if (this.properties['disableZoomControl'] === 'disable') {
            return false;
        }

        if (this.isTouchScreen && this.properties['disableZoomControl'] === 'auto') {
            return false;
        }

        return true;
    }

    ngOnChanges(changes: SimpleChanges) {
        let changedProperties = this.getProperties(changes);
        changedProperties = this.renameProperties(changedProperties);

        this.applyPropertiesDefault(this.defaultComponentProperties, changedProperties);
    }

    ngOnDestroy() {
        this.destroy();
    }

    toggleZoom() {
        this.pinchZoom.toggleZoom();
    }

    zoomPoint(point: MouseZoomPoint) {
        this.pinchZoom.stepZoom('IN', point);
    }

    zoomIn() {
        this.pinchZoom.stepZoom('IN');
    }

    zoomOut() {
        this.pinchZoom.stepZoom('OUT');
    }

    resetZoom() {
        this.pinchZoom.resetScale();
    }

    destroy() {
        if (this.pinchZoom) this.pinchZoom.destroy();
    }

    private initPinchZoom() {
        if (this.properties['disabled']) {
            return;
        }

        this.properties['element'] = this.elementRef.nativeElement.querySelector('.pinch-zoom-content');
        this.pinchZoom = new IvyPinch(this.properties, this.onZoomChange);
    }

    private getProperties(changes: SimpleChanges) {
        let properties: any = {};

        for (var prop in changes) {
            if (prop !== 'properties') {
                properties[prop] = changes[prop].currentValue;
            }
            if (prop === 'properties') {
                properties = changes[prop].currentValue;
            }
        }
        return properties;
    }

    private renameProperties(properties: any) {
        for (var prop in properties) {
            if (backwardCompatibilityProperties[prop]) {
                properties[backwardCompatibilityProperties[prop]] = properties[prop];
                delete properties[prop];
            }
        }

        return properties;
    }

    private applyPropertiesDefault(defaultProperties: PinchZoomProperties, properties: PinchZoomProperties): void {
        this.properties = Object.assign({}, defaultProperties, properties);
    }

    private detectLimitZoom() {
        if (this.pinchZoom) {
            this.pinchZoom.detectLimitZoom();
        }
    }

    private getPropertiesValue(propertyName: PropertyName) {
        if (this.properties && this.properties[propertyName]) {
            return this.properties[propertyName];
        } else {
            return this.defaultComponentProperties[propertyName];
        }
    }

    private getDefaultComponentProperties() {
        return { ...defaultProperties, ..._defaultComponentProperties };
    }
}
