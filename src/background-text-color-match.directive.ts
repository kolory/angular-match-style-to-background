import {Directive, Input, Renderer, OnChanges, SimpleChanges, Output, EventEmitter, ElementRef} from '@angular/core';
import {ColorUtilities, hexColor} from 'color-utilities';

@Directive({
  selector: '[match-text-color-to-background]',
  providers: [ColorUtilities]
})
export class MatchTextColorDirective implements OnChanges {

  @Input('match-text-color-to-background')
  backgroundColor: hexColor | null

  @Input()
  lightTextColor: hexColor = this.defaultLightColor

  @Input()
  darkTextColor: hexColor = this.defaultDarkColor

  @Output()
  colorChange = new EventEmitter<hexColor>()

  private get lightColor(): hexColor {
    return this.lightTextColor || this.defaultLightColor
  }

  private get darkColor(): hexColor {
    return this.darkTextColor || this.defaultDarkColor
  }

  private readonly defaultLightColor = ColorUtilities.white
  private readonly defaultDarkColor = ColorUtilities.black

  private currentColor: hexColor | null = this.darkColor

  constructor(private renderer: Renderer, private element: ElementRef, private colorUtilities: ColorUtilities) {}

  ngOnChanges({backgroundColor}: SimpleChanges) {
    const currentBcgColor = backgroundColor && backgroundColor.currentValue
    let textColor: hexColor

    if (currentBcgColor) {
      this.renderer.setElementStyle(this.element.nativeElement, 'backgroundColor', currentBcgColor)
      textColor = this.getColorWithHigherContrast(currentBcgColor)
    } else {
      textColor = this.darkColor
    }

    this.setTextColor(textColor)
  }

  private getColorWithHigherContrast(backgroundColor: hexColor): hexColor {
    const withLightContrast = this.colorUtilities.calculateContrastRatio(backgroundColor, this.lightColor)
    const withDarkContrast = this.colorUtilities.calculateContrastRatio(backgroundColor, this.darkColor)
    return withLightContrast > withDarkContrast ? this.lightColor : this.darkColor
  }

  private setTextColor(color: hexColor) {
    this.renderer.setElementStyle(this.element.nativeElement, 'color', color)
    if (color !== this.currentColor) {
      this.colorChange.emit(color)
      this.currentColor = color
    }
  }
}
