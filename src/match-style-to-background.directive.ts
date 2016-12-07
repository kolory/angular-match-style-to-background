import {Directive, Input, Renderer, OnChanges, SimpleChanges, Output, EventEmitter, ElementRef} from '@angular/core'
import {anyColor, ColorUtilities, Color} from '@kolory/color-utilities'
import {StylesDeclaration} from './styles-declaration.interface'
import {Style} from './style.interface'

const DIRECTIVE_NAME = 'match-style-to-background'
const MATCHED_CLASS_NAME_PREFIX = 'matched-'

@Directive({
  selector: `[${DIRECTIVE_NAME}]`
})

/**
 * Angular directive to match the text color and styles to the container's background color, making the text always
 * readable and other elements visible.
 *
 * Directive requires at least one input argument - match-style-to-background- with the value of the current
 * background color to which the font color and styles should be matched. In this case (no other inputs),
 * the font will be either black or white. The input expects a valid color string (in either hex, RGB or HSL
 * format) or a Color object.
 *
 * For more control, you can provide style definitions that will be used depending on which one of them have
 * higher contrast with the background. Style definition is an object whose key is the style name (any valid string)
 * and value is the Color object or a color string in hex, RGB or HSL format.
 *
 * When the style changes, the styleChange event is emitted with the changed style definition. This definition
 * is an object with name, color and contrast values. Name of the style is the same name that was defined in the
 * `styles` property. The same goes with the color. Contrast holds a value of the contrast ratio of the style's
 * color to the current background.
 *
 * Directive sets classes on the host element, depending on which style was matched. Class names are defined
 * by the style's name prefixed with "matched", eg. "matched-dark".
 *
 * @example
 * <!-- Simple use case. `backgroundColor` is a variable that holds the current color. Font will be black or white. -->
 * <div [match-style-to-background]="backgroundColor"> ... </div>
 *
 * For advanced use case, refer to the documentation.
 */
export class MatchStyleDirective implements OnChanges {

  /**
   * The current background color. The style will be decided depending on this value.
   */
  @Input(DIRECTIVE_NAME)
  backgroundColor: anyColor | Color | null

  /**
   * Styles that can be applied.
   */
  @Input()
  styles: StylesDeclaration | null

  /**
   * Optionally disable the the color style property sets on the host element.
   */
  @Input()
  setColor = true

  /**
   * Emits the selected style definition.
   */
  @Output()
  styleChange = new EventEmitter<Style>()

  // Used when no styles were provided.
  private readonly defaultStyles: StylesDeclaration = {
    'basic-light': Color.white,
    'basic-dark': Color.black
  }

  // Used when an invalid backgorund color was provided.
  private readonly initialStyle: Style = {
    name: 'no-style',
    color: Color.black,
    contrast: 21
  }

  private currentStyle: Style | null = this.initialStyle

  constructor(private renderer: Renderer, private element: ElementRef, private colorUtilities: ColorUtilities) {}

  ngOnChanges({backgroundColor, styles}: SimpleChanges) {
    /* tslint:disable:cyclomatic-complexity */
    if (styles && styles.currentValue) {
      this.validateStyles(styles.currentValue)
    }

    if (backgroundColor && backgroundColor.currentValue) {
      this.handleBackgroundChange(backgroundColor.currentValue)
    }
    /* tslint:enable */
  }

  private handleBackgroundChange(backgroundColor: string) {
    let style: Style
    if (this.isColorValid(backgroundColor)) {
      style = this.getStyleWithHighestContrast(Color.create(backgroundColor))
    } else {
      style = this.initialStyle
    }
    this.applyStyle(style)
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
