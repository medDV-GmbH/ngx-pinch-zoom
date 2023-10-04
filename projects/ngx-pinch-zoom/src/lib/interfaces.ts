export interface Properties {
    element?: HTMLElement;
    doubleTap?: boolean;
    doubleTapScale?: number;
    zoomControlScale?: number;
    transitionDuration?: number;
    autoZoomOut?: boolean;
    limitZoom?: number | string | 'original image size';
    disablePan?: boolean;
    limitPan?: boolean;
    minPanScale?: number;
    minScale?: number;
    eventHandler?: any;
    listeners?: 'auto' | 'mouse and touch';
    wheel?: boolean;
    fullImage?: {
        path: string;
        minScale?: number;
    };
    autoHeight?: boolean;
    wheelZoomFactor?: number;
    stepZoomFactor?: number;
    draggableImage?: boolean;
}


export interface PinchZoomProperties extends Properties {
    disabled?: boolean;
    overflow?: 'hidden' | 'visible';
    disableZoomControl?: 'disable' | 'never' | 'auto';
    backgroundColor?: string;
}

export interface ZoomEvent {
    scale: number;
    moveX: number;
    moveY: number;
}

export interface MouseZoomPoint{
    clientX: number;
    clientY: number;
}
