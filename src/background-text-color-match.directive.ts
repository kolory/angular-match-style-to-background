import {
  Directive, Input, Renderer, OnChanges, SimpleChanges, Output, EventEmitter, ElementRef,
  HostBinding
} from '@angular/core'
import {ColorUtilities, hexColor} from 'color-utilities'

@Directive({
  selector: '[match-text-color-to-background]'
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

  @HostBinding('class.matched-light')
  private get matchedLight(): boolean {
    return this.currentColor === this.lightColor
  }

  @HostBinding('class.matched-dark')
  private get matchedDark(): boolean {
    return this.currentColor === this.darkColor
  }

  private get lightColor(): hexColor | null {
    return this.isColorValid(this.lightTextColor) ? this.lightTextColor : this.defaultLightColor
  }

  private get darkColor(): hexColor | null {
    return this.isColorValid(this.darkTextColor) ? this.darkTextColor : this.defaultDarkColor
  }

  private readonly defaultLightColor: hexColor = ColorUtilities.color['white']
  private readonly defaultDarkColor: hexColor = ColorUtilities.color['black']

  private currentColor: hexColor | null = this.darkColor

  constructor(private renderer: Renderer, private element: ElementRef, private colorUtilities: ColorUtilities) {}

  ngOnChanges({backgroundColor}: SimpleChanges) {
    const currentBcgColor = backgroundColor && backgroundColor.currentValue
    let textColor: hexColor

    if (this.isColorValid(currentBcgColor)) {
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

  private setTextColor(color: hexColor): void {
    this.renderer.setElementStyle(this.element.nativeElement, 'color', color)
    if (color !== this.currentColor) {
      this.colorChange.emit(color)
      this.currentColor = color
    }
  }

  private isColorValid(color: hexColor): boolean {
    return this.colorUtilities.isValidHexColor(color)
  }
}
