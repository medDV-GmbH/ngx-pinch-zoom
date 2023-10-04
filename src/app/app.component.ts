import {AfterViewInit, Component, ViewChild} from '@angular/core';
import {MouseZoomPoint, ZoomEvent} from '../../projects/ngx-pinch-zoom/src/lib/interfaces';
import {PinchZoomComponent} from '../../projects/ngx-pinch-zoom/src/lib/pinch-zoom.component';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.sass'],
})
export class AppComponent {
    @ViewChild('demoPinch', { static: true }) demoPinch!: PinchZoomComponent;
    @ViewChild('demoPinch2', { static: true }) demoPinch2!: PinchZoomComponent;
    @ViewChild('demoPinch3', { static: true }) demoPinch3!: PinchZoomComponent;
    title = 'ivypinchApp';
    eventResult1?: ZoomEvent;

    zoomChange($event: ZoomEvent) {
        this.eventResult1 = $event;
    }

    zoomIn() {
        this.demoPinch2.zoomIn();
    }

    reset() {
        this.demoPinch2.resetZoom();
    }

    zoomOut() {
        this.demoPinch2.zoomOut();
    }


    zoomOnClick($event: MouseEvent) {
        const newPoint = {
            clientX: $event.clientX,
            clientY: $event.clientY
        } as MouseZoomPoint;

        this.demoPinch3.zoomPoint(newPoint);
    }
}
