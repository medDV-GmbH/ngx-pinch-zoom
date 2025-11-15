import { Properties } from './interfaces';

export const defaultProperties: Properties = {
    transitionDuration: 200,
    doubleTap: true,
    doubleTapScale: 2,
    limitZoom: 'original image size',
    autoZoomOut: false,
    zoomControlScale: 1,
    minPanScale: 1.0001,
    minScale: 0,
    listeners: 'mouse and touch',
    wheel: true,
    wheelZoomFactor: 0.2,
    draggableImage: false,
    draggableOnPinch: false,
};
