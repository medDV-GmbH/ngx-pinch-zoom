import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PinchZoomModule } from '../../projects/ngx-pinch-zoom/src/lib/pinch-zoom.module';
import {Router, Scroll} from '@angular/router';
import {ViewportScroller} from '@angular/common';
import {filter} from 'rxjs';

@NgModule({
    declarations: [AppComponent],
    imports: [BrowserModule, AppRoutingModule, PinchZoomModule],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {
    constructor(router: Router, viewportScroller: ViewportScroller) {
        viewportScroller.setOffset([0, 60]);
        router.events.pipe(filter(e => e instanceof Scroll)).subscribe((e: Scroll) => {
            if (e.anchor) {
                // anchor navigation
                setTimeout(() => {
                    viewportScroller.scrollToAnchor(e.anchor);
                })
            } else if (e.position) {
                // backward navigation
                viewportScroller.scrollToPosition(e.position);
            } else {
                // forward navigation
                viewportScroller.scrollToPosition([0, 0]);
            }
        });
    }
}
