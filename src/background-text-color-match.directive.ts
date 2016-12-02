import {
  Directive, Input, Renderer, OnChanges, SimpleChanges, Output, EventEmitter, ElementRef,
  HostBinding
} from '@angular/core'
import {anyColor, ColorUtilities} from '@radiatingstar/color-utilities'

@Directive({
  selector: '[match-text-color-to-background]'
})
export class MatchTextColorDirective implements OnChanges {

  @Input('match-text-color-to-background')
  backgroundColor: anyColor | null

  @Input()
  lightTextColor: anyColor = this.defaultLightColor

  @Input()
  darkTextColor: anyColor = this.defaultDarkColor

  @Output()
  colorChange = new EventEmitter<anyColor>()

  @HostBinding('class.matched-light')
  private get matchedLight(): boolean {
    return this.currentColor === this.lightColor
  }

  @HostBinding('class.matched-dark')
  private get matchedDark(): boolean {
    return this.currentColor === this.darkColor
  }

  private get lightColor(): anyColor | null {
    return this.isColorValid(this.lightTextColor) ? this.lightTextColor : this.defaultLightColor
  }

  private get darkColor(): anyColor | null {
    return this.isColorValid(this.darkTextColor) ? this.darkTextColor : this.defaultDarkColor
  }

  private readonly defaultLightColor: anyColor = ColorUtilities.color['white']
  private readonly defaultDarkColor: anyColor = ColorUtilities.color['black']

  private currentColor: anyColor | null = this.darkColor

  constructor(private renderer: Renderer, private element: ElementRef, private colorUtilities: ColorUtilities) {}

  ngOnChanges({backgroundColor}: SimpleChanges) {
    const currentBcgColor = backgroundColor && backgroundColor.currentValue
    let textColor: anyColor

    if (this.isColorValid(currentBcgColor)) {
      textColor = this.getColorWithHigherContrast(currentBcgColor)
    } else {
      textColor = this.darkColor
    }

    this.setTextColor(textColor)
  }

  private getColorWithHigherContrast(backgroundColor: anyColor): anyColor {
    const withLightContrast = this.colorUtilities.calculateContrastRatio(backgroundColor, this.lightColor)
    const withDarkContrast = this.colorUtilities.calculateContrastRatio(backgroundColor, this.darkColor)
    return withLightContrast > withDarkContrast ? this.lightColor : this.darkColor
  }

  private setTextColor(color: anyColor): void {
    this.renderer.setElementStyle(this.element.nativeElement, 'color', color)
    if (color !== this.currentColor) {
      this.colorChange.emit(color)
      this.currentColor = color
    }
  }

  private isColorValid(color: anyColor): boolean {
    return this.colorUtilities.isValidColor(color)
  }
}
