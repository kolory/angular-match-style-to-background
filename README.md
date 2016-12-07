# Angular directive for matching styles to background color depending on it's contrast
[![Build Status](https://travis-ci.org/kolory/angular-match-style-to-background.svg?branch=master)](https://travis-ci.org/kolory/angular-match-style-to-background)
[![Code Climate](https://codeclimate.com/github/kolory/angular-match-style-to-background/badges/gpa.svg)](https://codeclimate.com/github/kolory/angular-match-style-to-background)
[![Test Coverage](https://codeclimate.com/github/kolory/angular-match-style-to-background/badges/coverage.svg)](https://codeclimate.com/github/kolory/angular-match-style-to-background/coverage)

The directive makes sure the color of texts and other elements inside the parent with dynamically changed
background color will stay readable and visible. The new style is chosen from optionally provided styles declarations
by calculating it's contrast ratio with the current value of the background color.

## Installation and usage

```
npm install @kolory/angular-match-style-to-background
```

```
// 1. Import the directive's module.

import {NgModule, Component} from '@angular/core'
import {MatchStyleModule} from '@kolory/angular-match-style-to-background'

@NgModule({
  ...
  import: [MatchStyleModule, ...],
})
class App {}

// 2. Use in a component. For more advanced use case, refer to #examples
@Component({
  template: `<div [match-style-to-background]="backgroundColor"> ... </div>`
})
class MyComponent {
  backgroundColor = '#FFFFFF'
}
```

## Configuration

### Background color

```
match-style-to-background: string | Color
```
Directive expect at least the `match-style-to-background` to be set on the element to actually make it work.
This property holds the current value of the background color that will be used when choosing a proper style.

The property can handle a string of the valid hex, RGB or HSL color or
a [Color object](https://github.com/kolory/color-utilities#color-object).

### Styles

```
styles: {[index: string]: anyColor | Color}
```

The `styles` property is a kew-value map of the style name (the key) and it's corresponding color (a hex, RGB
or HSL string or a [Color object](https://github.com/kolory/color-utilities#color-object)). The name is later
used as a part of the class name set on the parent element and in the style definition object in the `styleChange`
event. It can be any valid string you want to name your style.

For example:
```
// Using the stirng values.
const myStyles = {
  radiant: '#FFFFFF',
  dire: '#000000'
}

// Using the Color object
const myStyles = {
  radiant: Color.white,
  dire: Color.black
}
```

### Setting the color style

By default, the directive changes the element's color CSS property to the color of the matched style to make 
texts readable. This means that in the simplest scenario, when there's only the required `match-style-to-background`
property set, everything is still usable. Default colors are black for light backgrounds and white for dark ones.

Since setting the style attribute might be too intrusive in some designs, this behavior can be turned off
by setting the `setColor` property to false. In this case, the text readability and it's color are responsibilities
of the component using this directive.

```
<!-- Turn off the automatic color changes. -->
<div [match-style-to-background]="color" [setColor]="false"> ... </div>
```

## Events

When the new style is selected, directive emits the `styleChange` event with the selected style's properties as
an event value. The object looks like this:
```
{
  name: 'light-style', // the style's name defined in the `styles` property
  color: Color('#FFFFFF'), // Color object made from the style's color
  contrast: 21 // the style's color contrast to the active background color
}
```

Example:

```
<div [match-style-to-background]="color" [styles]={light: Color('#FFFFFF'), ...}
     (styleChange)="handleStyleChange($event)"> ... </div>
     
// In a component
handleStyleChange(event) {
  // If the light style was matched, the event object is {name: 'light', color: Color('#FFFFFF'), contrast: 21}.
}
```

## Classes set on the host element

When the style is matched, the style match directive sets a class name on the host element to allow custom
styling and more advanced changes of design.

Class name added in this way is constructed from two parts: "matched-" prefix and the matched style's name.
For example, if the matched style was named "dark", then the newly appended class will be "matched-dark".

## Examples

### Text color is set automatically to match the unknown background color

The simples use of the directive is to only set the `match-style-to-background` property. The text color will be
changed using default black and white colors.

```
@Component({
  template: `
    <div [match-style-to-background]="randomlyPickColor()">
      This text will have a different color depending on which button was clicked.
    </div>`
})
class MyComponent {}
```

### Changing the text color when an action changes the background

Color is updated after user picks a color.

```
@Component({
  template: `
    <button (click)="background = '#000000'">Black</button>
    <button (click)="background = '#FFFFFF'">White</button>
    <div [match-style-to-background]="background" [styles]="{'light': '#EEEEEE', dark: '#101010'}">
      This text will have a different color depending on which button was clicked.
    </div>`
})
class MyComponent {}
```

### Changing the child elements look

Style change is defined in the stylesheet using the `.matched-` class names. Automatic color change is disabled
to make sure the CSS rules will be applied.

```
@Component({
  styles: [`
    .matched-light .child {
      color: purple;
    }
    .matched-dark .child {
      color: pink;
    }
  `],
  template: `
    <div [match-style-to-background]="background" [styles]="{'light': '#EEEEEE', dark: '#101010'}" [setColor]="false">
      <p class="child"> ... </p>
    </div>`
})
class MyComponent {}
```

### Defining styles and handling events

```
// Import the Color constructor. Color utilities is a dependency of this directive, so it's already available.
import {Color} from '@kolory/color-utilities'

// Import style interfaces.
import {StylesDeclaration, Style} from '@kolory/angular-match-style-to-background'

@Component({
  template: `
    <div [angular-match-style-to-background]="background" [styles]="styles" (styleChange)="handleChange($event)"></div>`
})
class MyComponent {
  styles: StylesDeclaration = {
    'ultra-red': Color.create('#FF0000'),
    'eco-green': Color.create('#00FF00'),
    'sky-blue': Color.create('#0000FF')
  }
  
  handleChange(changedStyle: Style) {
    // If 'ultra-red` was matched, then the method is called witn the object:
    // {name: 'ultra-red', color: Color('#FF0000'), contrast: 9}
    
    if (changedStyle.contrast < 10) {
      alert(`The ${changedStyle.name}` constrast is too low. ${changedStyle.color.hex}" won't work.`)
    }
  }
}
```

## License
MIT
