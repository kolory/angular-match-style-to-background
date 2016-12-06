import {
  Directive, Input, Renderer, OnChanges, SimpleChanges, Output, EventEmitter, ElementRef,
  HostBinding
} from '@angular/core'
import {anyColor, ColorUtilities, Color} from '@kolory/color-utilities'

const DIRECTIVE_NAME = 'match-text-color-to-background'

@Directive({
  selector: '[match-text-color-to-background]'
})
export class MatchTextColorDirective implements OnChanges {

  @Input(DIRECTIVE_NAME)
  backgroundColor: anyColor | Color | null

  @Input()
  lightTextColor: anyColor | Color = this.defaultLightColor

  @Input()
  darkTextColor: anyColor | Color = this.defaultDarkColor

  @Output()
  colorChange = new EventEmitter<Color>()

  @HostBinding('class.matched-light')
  private get matchedLight(): boolean {
    return this.currentColor === this.lightColor
  }

  @HostBinding('class.matched-dark')
  private get matchedDark(): boolean {
    return this.currentColor === this.darkColor
  }

  private get lightColor(): Color | null {
    return this.resolveColor(this.lightTextColor, this.defaultLightColor)
  }

  private get darkColor(): Color | null {
    return this.resolveColor(this.darkTextColor, this.defaultDarkColor)
  }

  private readonly defaultLightColor = Color.white
  private readonly defaultDarkColor = Color.black

  private currentColor: Color | null = this.darkColor

  constructor(private renderer: Renderer, private element: ElementRef, private colorUtilities: ColorUtilities) {}

  ngOnChanges({backgroundColor}: SimpleChanges) {
    const currentBcgColor = backgroundColor && backgroundColor.currentValue
    let textColor: Color

    if (this.isColorValid(currentBcgColor)) {
      textColor = this.getColorWithHigherContrast(Color.create(currentBcgColor))
    } else {
      textColor = this.darkColor
    }

    this.setTextColor(textColor)
  }

  private resolveColor(color: anyColor | Color, defaultColor: Color): Color {
    if (Color.isColor(color)) {
      return color as Color
    } else if (this.isColorValid(color as anyColor)) {
      return Color.create(color)
    } else {
      return defaultColor
    }
  }

  private getColorWithHigherContrast(backgroundColor: Color): Color {
    const withLightContrast = backgroundColor.calculateContrastTo(this.lightColor)
    const withDarkContrast = backgroundColor.calculateContrastTo(this.darkColor)
    return withLightContrast > withDarkContrast ? this.lightColor : this.darkColor
  }

  private setTextColor(color: Color): void {
    this.renderer.setElementStyle(this.element.nativeElement, 'color', color.toString())
    if (!color.equals(this.currentColor)) {
      this.colorChange.emit(color)
      this.currentColor = color
    }
  }

  private isColorValid(color: anyColor | Color): boolean {
    return Color.isColor(color) || this.colorUtilities.isValidColor(color as anyColor)
  }
}
