import {
    Component,
    ElementRef,
    HostBinding,
    OnDestroy,
    effect,
    input,
    output,
    computed,
    signal
} from '@angular/core';

import { Properties } from './interfaces';
import { defaultProperties } from './properties';
import { IvyPinch } from './ivypinch';
import { CommonModule } from "@angular/common";

interface ComponentProperties extends Properties {
    disabled?: boolean;
    overflow?: 'hidden' | 'visible';
    disableZoomControl?: 'disable' | 'never' | 'auto';
    backgroundColor?: string;
}

const defaultComponentProperties: ComponentProperties = {
    ...defaultProperties,
    overflow: 'hidden',
    disableZoomControl: 'auto',
    backgroundColor: 'rgba(0,0,0,0.85)',
};

@Component({
    selector: 'pinch-zoom, [pinch-zoom]',
    exportAs: 'pinchZoom',
    templateUrl: './pinch-zoom.component.html',
    styleUrls: ['./pinch-zoom.component.sass'],
    standalone: true,
    imports: [CommonModule]
})
export class PinchZoomComponent implements OnDestroy {
    private pinchZoom: IvyPinch | null = null;

    // Signals for inputs
    readonly properties = input<ComponentProperties>();
    readonly transitionDuration = input<number>();
    readonly doubleTap = input<boolean>();
    readonly doubleTapScale = input<number>();
    readonly autoZoomOut = input<boolean>();
    readonly limitZoom = input<number | 'original image size'>();
    readonly disabled = input<boolean>();
    readonly disablePan = input<boolean>();
    readonly overflow = input<'hidden' | 'visible'>();
    readonly zoomControlScale = input<number>();
    readonly disableZoomControl = input<'disable' | 'never' | 'auto'>();
    readonly backgroundColor = input<string>();
    readonly limitPan = input<boolean>();
    readonly minPanScale = input<number>();
    readonly minScale = input<number>();
    readonly listeners = input<'auto' | 'mouse and touch'>();
    readonly wheel = input<boolean>();
    readonly autoHeight = input<boolean>();
    readonly wheelZoomFactor = input<number>();
    readonly draggableImage = input<boolean>();
    readonly draggableOnPinch = input<boolean>();

    // Output signal
    readonly zoomChanged = output<number>();

    // Internal signals
    private currentScale = signal<number>(1);

    // Computed merged properties
    readonly mergedProperties = computed<ComponentProperties>(() => {
        const props = this.properties() || {};
        return {
            ...defaultComponentProperties,
            ...props,
            transitionDuration: this.transitionDuration() ?? props.transitionDuration ?? defaultComponentProperties.transitionDuration,
            doubleTap: this.doubleTap() ?? props.doubleTap ?? defaultComponentProperties.doubleTap,
            doubleTapScale: this.doubleTapScale() ?? props.doubleTapScale ?? defaultComponentProperties.doubleTapScale,
            autoZoomOut: this.autoZoomOut() ?? props.autoZoomOut ?? defaultComponentProperties.autoZoomOut,
            limitZoom: this.limitZoom() ?? props.limitZoom ?? defaultComponentProperties.limitZoom,
            disabled: this.disabled() ?? props.disabled ?? defaultComponentProperties.disabled,
            disablePan: this.disablePan() ?? props.disablePan ?? defaultComponentProperties.disablePan,
            overflow: this.overflow() ?? props.overflow ?? defaultComponentProperties.overflow,
            zoomControlScale: this.zoomControlScale() ?? props.zoomControlScale ?? defaultComponentProperties.zoomControlScale,
            disableZoomControl: this.disableZoomControl() ?? props.disableZoomControl ?? defaultComponentProperties.disableZoomControl,
            backgroundColor: this.backgroundColor() ?? props.backgroundColor ?? defaultComponentProperties.backgroundColor,
            limitPan: this.limitPan() ?? props.limitPan ?? defaultComponentProperties.limitPan,
            minPanScale: this.minPanScale() ?? props.minPanScale ?? defaultComponentProperties.minPanScale,
            minScale: this.minScale() ?? props.minScale ?? defaultComponentProperties.minScale,
            listeners: this.listeners() ?? props.listeners ?? defaultComponentProperties.listeners,
            wheel: this.wheel() ?? props.wheel ?? defaultComponentProperties.wheel,
            autoHeight: this.autoHeight() ?? props.autoHeight ?? defaultComponentProperties.autoHeight,
            wheelZoomFactor: this.wheelZoomFactor() ?? props.wheelZoomFactor ?? defaultComponentProperties.wheelZoomFactor,
            draggableImage: this.draggableImage() ?? props.draggableImage ?? defaultComponentProperties.draggableImage,
            draggableOnPinch: this.draggableOnPinch() ?? props.draggableOnPinch ?? defaultComponentProperties.draggableOnPinch,
        };
    });

    @HostBinding('style.overflow')
    get hostOverflow(): 'hidden' | 'visible' {
        return this.mergedProperties().overflow!;
    }

    @HostBinding('style.background-color')
    get hostBackgroundColor(): string {
        return this.mergedProperties().backgroundColor!;
    }

    get isTouchScreen(): boolean {
        const prefixes = ' -webkit- -moz- -o- -ms- '.split(' ');
        const mq = (query: string): boolean => {
            return window.matchMedia(query).matches;
        };

        if ('ontouchstart' in window) {
            return true;
        }

        const query = ['(', prefixes.join('touch-enabled),('), 'heartz', ')'].join('');
        return mq(query);
    }

    get isDragging(): boolean {
        return this.pinchZoom?.isDragging() ?? false;
    }

    get isDisabled(): boolean {
        return this.mergedProperties().disabled ?? false;
    }

    get scale(): number {
        return this.pinchZoom?.scale ?? 1;
    }

    get isZoomedIn(): boolean {
        return this.scale > 1;
    }

    get scaleLevel(): number {
        return Math.round(this.scale / (this.mergedProperties().zoomControlScale ?? 1));
    }

    get maxScale(): number {
        return this.pinchZoom?.maxScale ?? 3;
    }

    get isZoomLimitReached(): boolean {
        return this.scale >= this.maxScale;
    }

    constructor(private elementRef: ElementRef<HTMLElement>) {
        // Initialize pinch zoom when component is created
        effect(() => {
            const props = this.mergedProperties();

            // Destroy existing instance if any
            if (this.pinchZoom) {
                this.pinchZoom.destroy();
                this.pinchZoom = null;
            }

            // Don't initialize if disabled
            if (props.disabled) {
                return;
            }

            // Initialize with merged properties
            this.initPinchZoom(props);
        });
    }

    ngOnDestroy(): void {
        this.destroy();
    }

    private initPinchZoom(props: ComponentProperties): void {
        const element = this.elementRef.nativeElement.querySelector('.pinch-zoom-content') as HTMLElement;

        if (!element) {
            return;
        }

        const ivyProps: Properties = {
            ...props,
            element,
        };

        this.pinchZoom = new IvyPinch(ivyProps, (scale: number) => {
            this.currentScale.set(scale);
            this.zoomChanged.emit(scale);
        });

        // Detect limit zoom after initialization
        this.detectLimitZoom();
    }

    toggleZoom(): void {
        this.pinchZoom?.toggleZoom();
    }

    zoomIn(value: number): number {
        return this.pinchZoom?.zoomIn(value) ?? 1;
    }

    zoomOut(value: number): number {
        return this.pinchZoom?.zoomOut(value) ?? 1;
    }

    isControl(): boolean {
        const props = this.mergedProperties();

        if (this.isDisabled) {
            return false;
        }

        if (props.disableZoomControl === 'disable') {
            return false;
        }

        if (this.isTouchScreen && props.disableZoomControl === 'auto') {
            return false;
        }

        return true;
    }

    detectLimitZoom(): void {
        this.pinchZoom?.detectLimitZoom();
    }

    destroy(): void {
        this.pinchZoom?.destroy();
        this.pinchZoom = null;
    }
}
