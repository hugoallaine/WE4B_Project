import { Injectable, Renderer2 } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HorizontalScrollService {

  constructor() { }

  applySmoothScroll(section: HTMLElement, renderer: Renderer2): void {
    let isScrolling: boolean;
    let targetScrollLeft = 0;
    let scrollTimeout: any;

    const smoothScroll = () => {
      if (isScrolling) {
        const currentScrollLeft = section.scrollLeft;
        const distance = targetScrollLeft - currentScrollLeft;
        section.scrollLeft += distance * 0.1;

        if (Math.abs(distance) > 1) {
          requestAnimationFrame(smoothScroll);
        } else {
          section.scrollLeft = targetScrollLeft;
          isScrolling = false;
        }
      }
    };

    renderer.listen(section, 'wheel', (event: WheelEvent) => {
      event.preventDefault();
      targetScrollLeft += event.deltaY;
      targetScrollLeft = Math.max(0, Math.min(targetScrollLeft, section.scrollWidth - section.clientWidth));

      if (!isScrolling) {
        isScrolling = true;
        smoothScroll();
      }

      // Add 'scrolling' class and remove it after a delay
      renderer.addClass(section, 'scrolling');
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        renderer.removeClass(section, 'scrolling');
      }, 200); // Adjust the delay as needed
    });
  }
}
