import {TestBed, ComponentFixture} from '@angular/core/testing'
import {Component, DebugElement} from '@angular/core'
import {By} from '@angular/platform-browser'
import {MatchTextColorDirective} from './background-text-color-match.directive'
import {ColorUtilities, hexColor} from '@radiatingstar/color-utilities'

const black = '#000000'
const white = '#FFFFFF'
const initialBcgColor = '#000000'

@Component({
  template: `<div [match-text-color-to-background]="backgroundColor" (colorChange)="currentColor = $event"
                  [lightTextColor]="lightTextColor" [darkTextColor]="darkTextColor"></div>`
})
class TestComponent {
  backgroundColor: hexColor | null = initialBcgColor
  lightTextColor: hexColor | null
  darkTextColor: hexColor | null
  currentColor: hexColor | null
}

describe('Background to text color match directive', () => {
  const colorUtilities = new ColorUtilities()

  let fixture: ComponentFixture<TestComponent>
  let component: TestComponent
  let debugElement: DebugElement

  const getTextColor = () => debugElement.styles['color']
  const makeChange = () => fixture.detectChanges()
  const setBackground = (color: hexColor) => {
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

  // Initial binding.
  beforeEach(makeChange)

  it('should not modify the background color of the host element', () => {
    expect(debugElement.styles['backgroundColor']).toBeUndefined()
  })

  it('should set an initial text color value based on the provided background color', () => {
    expect(component.backgroundColor).toBe(initialBcgColor)
    expect(getTextColor())
  })

  it('should use the dark text color in case the background color is not defined', () => {
    component.darkTextColor = black
    component.lightTextColor = white
    setBackground(null)
    expect(getTextColor()).toBe(black)
  })

  it('should dynamically switch between text colors on background color change', () => {
    component.lightTextColor = white
    component.darkTextColor = black
    expect(getTextColor()).toBe(white)
    setBackground(white)
    expect(getTextColor()).toBe(black)
    setBackground(black)
    expect(getTextColor()).toBe(white)
  })

  it('should actually ignore consumer\'s declaration which color is which and calculate contrast itself', () => {
    // Mismatched declarations. Light is darker than dark.
    component.lightTextColor = black
    component.darkTextColor = white
    setBackground(white)
    expect(getTextColor()).toBe(black) // White background, so black font. Even though it's "darkTextColor".
    setBackground(black)
    expect(getTextColor()).toBe(white) // Likewise. White background, black font color taken from "darkTextColor".
  })

  it('should have default color values with enough contrast to each other used when no color is provided', () => {
    expect(component.darkTextColor).toBeUndefined()
    expect(component.lightTextColor).toBeUndefined()
    let lightColor: hexColor = getTextColor()
    setBackground(white)
    let darkColor: hexColor = getTextColor()
    expect(colorUtilities.calculateContrastRatio(lightColor, darkColor)).toBeGreaterThanOrEqual(17)
  })

  it('should inform a parent component about the color change', () => {
    expect(component.currentColor).toBe(white) // Initial setting
    setBackground(white)
    expect(component.currentColor).toBe(black)
    setBackground('#FEFEFE') // Small change to make sure the color of the text will not change
    expect(component.currentColor).toBe(black)
  })

  it('should allow using shorthand color values and small letters', () => {
    component.darkTextColor = '#333'
    setBackground('#fff')
    expect(getTextColor()).toBe('#333')
  })

  it('should set the text color to the default state when a background color is not valid HEX', () => {
    // 1. Initially change the text color so it won't be in the default state.
    setBackground(black)
    expect(getTextColor()).toBe(white)
    // 2. Change the background color to an invalid one.
    setBackground('invalid-color')
    expect(getTextColor()).toBe(black)
  })

  it('should use default text colors if invalid values were provided', () => {
    component.darkTextColor = 'invalid'
    component.lightTextColor = 'invalid'
    makeChange()
    // 1. initially, the default color should be set.
    expect(getTextColor()).not.toBe(component.darkTextColor)
    // 2. Then, when changing to a dark color, initial light text color should be used.
    setBackground(black)
    expect(getTextColor).not.toBe(component.lightTextColor)
  })

  it('should set a class name on the host element to inform which color was matched', () => {
    // Initially the light text should be matched (since the default color in test is black).
    expect(debugElement.classes['matched-light']).toBeTruthy()

    // Change to the light variant.
    setBackground(white)
    expect(debugElement.classes['matched-dark']).toBeTruthy()

    // And back again to dark, to make sure everything works fine.
    setBackground(black)
    expect(debugElement.classes['matched-light']).toBeTruthy()
  })
})
