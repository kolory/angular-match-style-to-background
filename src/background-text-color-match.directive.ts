import {
  Directive, Input, Renderer, OnChanges, SimpleChanges, Output, EventEmitter, ElementRef,
  HostBinding
} from '@angular/core'
import {anyColor, ColorUtilities, Color} from '@kolory/color-utilities'

const DIRECTIVE_NAME = 'match-text-color-to-background'

@Directive({
  selector: `[${DIRECTIVE_NAME}]`
})

/**
 * Angular directive to match the text color to the container's background color, making the text always
 * readable.
 *
 * Directive requires at least one input argument - match-text-color-to-background - with the value of the current
 * background color to which the font color should be matched. In this case, the font will be either black or white,
 *
 * For more control, there are two optional inputs: lightTextColor and darkTextColor that will be used depending
 * on which one of them have higher contrast with the background.
 *
 * All three inputs expect a string (valid hex, RGB or HSL color) or a Color object (coming from the ColorUtilities
 * library).
 *
 * When the font color is changes, the colorChange event is emitted with the changed color (as a Color object).
 *
 * Directive sets two classes on the host element, depending on which type of color was matched. Class names are:
 * matched-light and matched-dark.
 *
 * @example
 * <!-- Simple use case. `backgroundColor` is a variable that holds the current color. Font will be black or white. -->
 * <div [match-text-color-to-background]="backgroundColor"> ... </div>
 *
 * @example
 * <!-- Advanced use case. -->
 * <div [match-text-color-to-background]="backgroundColor" lightColor="#FFFFFF" [darkColor]="blackColor"
 *     (colorChange)="handleColorChange($event)"> ... </div>
 */
export class MatchTextColorDirective implements OnChanges {

  /**
   * The current background color. A font color will be decided depending on this value.
   */
  @Input(DIRECTIVE_NAME)
  backgroundColor: anyColor | Color | null

  /**
   * Color to be used when the background is dark. By default it's white.
   */
  @Input()
  lightTextColor: anyColor | Color = this.defaultLightColor

  /**
   * Color to be used when the background is light. By default it's black.
   */
  @Input()
  darkTextColor: anyColor | Color = this.defaultDarkColor

  /**
   * When the font color is changed, event is emitted with the current value of a color.
   */
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
