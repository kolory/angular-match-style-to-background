import {
  Directive, Input, Renderer, OnChanges, SimpleChanges, Output, EventEmitter, ElementRef,
  HostBinding
} from '@angular/core'
import {anyColor, ColorUtilities, Color} from '@kolory/color-utilities'
import {StylesDeclaration} from './styles-declaration';
import {Style} from './style';

const DIRECTIVE_NAME = 'match-style-to-background'
const MATCHED_CLASS_NAME_PREFIX = 'matched-'

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
  styles: StylesDeclaration | null

  /**
   * Optionally sets the color style property on the host element.
   */
  @Input()
  setColor = false

  /**
   * When the font color is changed, event is emitted with the current value of a color.
   */
  @Output()
  styleChange = new EventEmitter<Style>()

  private readonly defaultStyles: StylesDeclaration = {
    'basic-light': Color.white,
    'basic-dark': Color.black
  }

  private readonly initialStyle: Style = {
    name: 'no-style',
    color: Color.black,
    contrast: 21
  }

  private currentStyle: Style | null = this.initialStyle

  constructor(private renderer: Renderer, private element: ElementRef, private colorUtilities: ColorUtilities) {}

  ngOnChanges({backgroundColor, styles}: SimpleChanges) {
    if (styles && styles.currentValue) {
      this.validateStyles(styles.currentValue)
    }

    const currentBcgColor = backgroundColor && backgroundColor.currentValue
    if (currentBcgColor) {
      let style: Style
      if (this.isColorValid(currentBcgColor)) {
        style = this.getStyleWithHighestContrast(Color.create(currentBcgColor))
      } else {
        style = this.initialStyle
      }
      this.applyStyle(style)
    }
  }

  private validateStyles(styles: StylesDeclaration): void {
    Object.keys(styles).forEach(name => {
      const style = styles[name]
      if (!Color.isColor(style) && !this.colorUtilities.isValidColor(style as string)) {
        throw new TypeError(`Invalid style used. Expected a map of colors, but got ${style}.`)
      }
    })
  }

  private getStyleWithHighestContrast(backgroundColor: Color): Style {
    const styles = this.styles && Object.keys(this.styles).length ? this.styles : this.defaultStyles
    return Object.keys(styles)
      .map(name => ({
        name,
        color: Color.create(styles[name]),
        contrast: backgroundColor.calculateContrastTo(styles[name])
      }))
      .reduce((currentStyle, style) => currentStyle.contrast > style.contrast ? currentStyle : style)
  }

  private applyStyle(style: Style): void {
    if (style.name !== this.currentStyle.name) {
      if (this.setColor) {
        this.renderer.setElementStyle(this.element.nativeElement, 'color', style.color.hex)
      }
      this.renderer.setElementClass(this.element.nativeElement,
        `${MATCHED_CLASS_NAME_PREFIX}${this.currentStyle.name}`, false)
      this.renderer.setElementClass(this.element.nativeElement, `${MATCHED_CLASS_NAME_PREFIX}${style.name}`, true)
      this.styleChange.emit(style)
      this.currentStyle = style
    }
  }

  private isColorValid(color: anyColor | Color): boolean {
    return Color.isColor(color) || this.colorUtilities.isValidColor(color as anyColor)
  }
}
