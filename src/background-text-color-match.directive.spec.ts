import {TestBed, ComponentFixture} from '@angular/core/testing'
import {Component, DebugElement} from '@angular/core'
import {By} from '@angular/platform-browser'
import {MatchTextColorDirective} from './background-text-color-match.directive'
import {ColorUtilities, hexColor, anyColor, Color} from '@kolory/color-utilities'
import {StylesDeclaration} from './styles-declaration';
import {Style} from './style';

/* tslint: disable */
@Component({
  template: `<div [match-style-to-background]="backgroundColor" (styleChange)="currentStyle = $event"
                  [styles]="styles"></div>`
})
class TestComponent {
  backgroundColor: Color | anyColor | null
  styles: StylesDeclaration | null = null
  currentStyle: Style = null
}
/* tslint:enable */

describe('Style to background match directive', () => {
  const colorUtilities = new ColorUtilities()

  let basicStyles: StylesDeclaration
  let fixture: ComponentFixture<TestComponent>
  let component: TestComponent
  let debugElement: DebugElement

  const getTextColor = () => debugElement.styles['color']
  const makeChange = () => fixture.detectChanges()
  const setBackground = (color: hexColor | Color) => {
    component.backgroundColor = color
    makeChange()
  }

  beforeEach(() => {
    fixture = TestBed.configureTestingModule({
      providers: [ColorUtilities],
      declarations: [MatchTextColorDirective, TestComponent]
    }).createComponent(TestComponent)
    component = fixture.componentInstance
    debugElement = fixture.debugElement.query(By.css('div'))
  })

  beforeEach(() => {
    basicStyles = {
      light: Color.white,
      dark: Color.black
    }
  })

  // Initial binding.
  beforeEach(makeChange)

  it('should not make any change initially', () => {
    expect(component.currentStyle).toBeNull()
  })

  it('should set the element\'s class name depending on the matched style', () => {
    component.styles = basicStyles
    setBackground(Color.black)
    expect(debugElement.classes['matched-light']).toBeTruthy()
    setBackground(Color.white)
    expect(debugElement.classes['matched-light']).toBeFalsy()
    expect(debugElement.classes['matched-dark']).toBeTruthy()
  })

  it('should allow using RGB, hex and HSL values', () => {
    makeChange()
    component.styles = {'hex': '#FFFFFF'}
    setBackground(Color.black)
    expect(component.currentStyle.name).toBe('hex')
    component.styles = {'rgb': 'rgb(255, 255, 255)'}
    setBackground('rgb(0, 0, 0)')
    expect(component.currentStyle.name).toBe('rgb')
    component.styles = {'hsl': 'hsl(0, 100%, 100%)'}
    setBackground('hsl(0, 0%, 0%)')
    expect(component.currentStyle.name).toBe('hsl')
  })

  it('should have default styles when no styles were provided', () => {
    component.styles = null
    setBackground(Color.white)
    expect(component.currentStyle.name).toBe('basic-dark')
    expect(component.currentStyle.color.hex).toBe(Color.black.hex)
    setBackground(Color.black)
    expect(component.currentStyle.name).toBe('basic-light')
    expect(component.currentStyle.color.hex).toBe(Color.white.hex)
  })

  it('should default to the no-style when background color is invalid', () => {
    component.styles = basicStyles
    setBackground('invalid')
    expect(component.currentStyle).toBeNull()
  })

  it('should inform about style change', () => {
    component.styles = basicStyles
    setBackground(Color.black)
    expect(component.currentStyle).toBeDefined()
    expect(component.currentStyle.name).toBe('light')
    setBackground(Color.white)
    expect(component.currentStyle.name).toBe('dark')
  })

  it('should not allow using invalid colors in styles definition', () => {
    component.styles = {'invalid' : 'rgb(300, 300, 300)'}
    expect(() => setBackground(Color.white)).toThrow()
  })

  it('should allow using only one style', () => {
    component.styles = {single: Color.red}
    setBackground(Color.black)
    expect(component.currentStyle).toBeDefined()
    expect(component.currentStyle.name).toBe('single')
    expect(debugElement.classes['matched-single']).toBeTruthy()

    setBackground(Color.white)
    expect(component.currentStyle.name).toBe('single')
    expect(debugElement.classes['matched-single']).toBeTruthy()
  })

  it('should handle more than two styles definitions', () => {
    component.styles = {red: Color.red, green: Color.green, blue: Color.blue}
    setBackground(Color.red)
    expect(component.currentStyle.name).toBe('green')
    setBackground(Color.green)
    expect(component.currentStyle.name).toBe('blue')
    setBackground(Color.blue)
    expect(component.currentStyle.name).toBe('green') // Curiously, it's not red.
  })

  it('should set the element\'s color when requested', () => {

  })
})
