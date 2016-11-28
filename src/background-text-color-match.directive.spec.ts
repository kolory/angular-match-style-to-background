import {TestBed, ComponentFixture} from '@angular/core/testing'
import {Component, DebugElement} from '@angular/core';
import {By} from '@angular/platform-browser';
import {MatchTextColorDirective} from './background-text-color-match.directive'
import {ColorUtilities, hexColor} from 'color-utilities'

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
  let testBed: typeof TestBed
  let fixture: ComponentFixture<TestComponent>
  let component: TestComponent
  let debugElement: DebugElement
  const colorUtilities = new ColorUtilities()

  const getBcgColor = () => debugElement.styles['backgroundColor']
  const getTextColor = () => debugElement.styles['color']

  beforeEach(() => {
    testBed = TestBed.configureTestingModule({
      providers: [ColorUtilities],
      declarations: [MatchTextColorDirective, TestComponent]
    })
    fixture = testBed.createComponent(TestComponent)
    component = fixture.componentInstance
    debugElement = fixture.debugElement.query(By.css('div'))
  })

  beforeEach(() => {
    expect(getBcgColor()).toBeUndefined()
    fixture.detectChanges()
  })

  it('should set the background color to the provided color', () => {
    expect(getBcgColor()).toBe(initialBcgColor)
  })

  it('should set an initial text color value based on the provided background color', () => {
    expect(getBcgColor()).toBe(initialBcgColor)
    expect(getTextColor())
  })

  it('should use the dark text color in case the background color is not defined', () => {
    component.backgroundColor = null
    component.darkTextColor = black
    component.lightTextColor = white
    fixture.detectChanges()
    expect(getTextColor()).toBe(black)
  })

  it('should dynamically switch between text colors on background color change', () => {
    component.lightTextColor = white
    component.darkTextColor = black
    expect(getTextColor()).toBe(white)
    component.backgroundColor = white
    fixture.detectChanges()
    expect(getTextColor()).toBe(black)
    component.backgroundColor = black
    fixture.detectChanges()
    expect(getTextColor()).toBe(white)
  })

  it('should have default text color values with enough contrast to each other (> 17) used when no colors are provided', () => {
    expect(component.darkTextColor).toBeUndefined()
    expect(component.lightTextColor).toBeUndefined()
    expect(getBcgColor()).toBe(initialBcgColor)
    let lightColor: hexColor = getTextColor()
    component.backgroundColor = white
    fixture.detectChanges()
    let darkColor: hexColor = getTextColor()
    expect(colorUtilities.calculateContrastRatio(lightColor, darkColor)).toBeGreaterThanOrEqual(17)
  })

  it('should inform a parent component about the color change', () => {
    expect(component.currentColor).toBe(white) // Initial setting
    component.backgroundColor = white
    fixture.detectChanges()
    expect(component.currentColor).toBe(black)
    component.backgroundColor = '#FEFEFE' // Small change to make sure the color of the text will not change
    fixture.detectChanges()
    expect(component.currentColor).toBe(black)
  })

  it('should allow using shorthand color values and small letters', () => {
    component.backgroundColor = '#fff'
    component.darkTextColor = '#333'
    fixture.detectChanges()
    expect(getTextColor()).toBe('#333')
  })

  it('should not allow using invalid color values', () => {
    // TODO
  })
})
