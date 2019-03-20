import { Component, OnInit, ViewChild, AfterViewInit, ElementRef } from '@angular/core';

interface IPosition {
  x: number;
  y: number;
}

// TODO: Find a way around all @ts-ignore
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit {
  // Canvas size
  @ViewChild('signatureWrapper') signatureWrapper: ElementRef;
  public canvasWidth: number = 200;
  public canvasHeight: number = 200;

  // Canvas setup
  @ViewChild('signatureCanvas') signatureCanvas: ElementRef;
  public context: CanvasRenderingContext2D;
  private penWidth: number = 2;

  // Drawing
  public drawing: boolean = false;
  private currentPosition: IPosition = { x: 0, y: 0 };
  private lastPosition: IPosition = this.currentPosition;

  // Init
  ngOnInit(): void {
    this.canvasWidth = this.signatureWrapper.nativeElement.offsetWidth;
    this.canvasHeight = this.signatureWrapper.nativeElement.offsetHeight;
  }
  ngAfterViewInit(): void {
    this.context = this.signatureCanvas.nativeElement.getContext('2d');
    this.context.lineWidth = this.penWidth;

    // @ts-ignore
    window.requestAnimFrame = function() {
      // @ts-ignore
      return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback) { window.setTimeout(callback, 1000 / 60); };
    };

    this.renderLoop();
  }

  // Renderer
  private renderLoop(): void {
    // @ts-ignore
    window.requestAnimFrame(this.renderLoop);
    this.renderCanvas();
  }
  private renderCanvas(): void {
    if (this.drawing) {
      this.context.moveTo(this.lastPosition.x, this.lastPosition.y);
      this.context.lineTo(this.currentPosition.x, this.currentPosition.y);

      this.context.stroke();
      this.lastPosition = this.currentPosition;
    }
  }

  // Signature options
  public downloadSignature(): void {
    let e = document.createElement('a')
    e.setAttribute('href', `data:image/png;base64, ${this.signatureCanvas.nativeElement.toDataURL('image/png').replace(/^data:image\/(png|jpg);base64,/, '')}`);
    e.setAttribute('download', 'YourSignature.png');

    e.style.display = 'none';
    document.body.appendChild(e);
    e.click();
    document.body.removeChild(e);
  }
  public clearSignature(): void {
    this.context.clearRect(0, 0, this.signatureCanvas.nativeElement.width, this.signatureCanvas.nativeElement.height);
    this.signatureCanvas.nativeElement.width = this.signatureCanvas.nativeElement.width;
  }

  // Mouse events
  public mouseStartDraw(e): void {
    this.drawing = true;
    this.lastPosition = this.getMousePosition(e);
  }
  public mouseStopDraw(): void {
    this.drawing = false;
  }
  public mouseDraw(e): void {
    this.currentPosition = this.getMousePosition(e);
    this.renderCanvas()
  }
  private getMousePosition(e): IPosition {
    let rect = this.signatureCanvas.nativeElement.getBoundingClientRect();

    return {
      x: e.clientX-rect.left,
      y: e.clientY-rect.top
    }
  }

  // Touch events
  public touchStartDraw(e): void {
    this.currentPosition = this.getTouchPosition(e);

    let touch = e.touches[0];
    let mouseEvent = new MouseEvent('mousedown', {
      clientX: touch.clientX,
      clientY: touch.clientY
    });

    this.signatureCanvas.nativeElement.dispatchEvent(mouseEvent);
  }
  public touchStopDraw(): void {
    let mouseEvent = new MouseEvent('mouseup', {});
    this.signatureCanvas.nativeElement.dispatchEvent(mouseEvent);
  }
  public touchDraw(e): void {
    this.currentPosition = this.getTouchPosition(e);

    let touch = e.touches[0];
    let mouseEvent = new MouseEvent('mousemove', {
      clientX: touch.clientX,
      clientY: touch.clientY
    });

    this.signatureCanvas.nativeElement.dispatchEvent(mouseEvent);
  }
  private getTouchPosition(e): IPosition {
    let rect = this.signatureCanvas.nativeElement.getBoundingClientRect();

    return {
      x: e.touches[0].clientX-rect.left,
      y: e.touches[0].clientY-rect.top
    }
  }
}
