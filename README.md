# Angular directive for matching a font color to background color depending on it's contrast

The directive makes sure a color of texts inside the element with dynamically changed background color
will stay readable. The color is chosen from two optionally provided values representing a light and
dark variant depending on their contrast ratio with the current value of the background color.

## Installation and usage

```
npm install @kolory/angular-text-color-to-background-match
```

```
// 1. Import the directive's module.

import {NgModule, Component} from '@angular/core'
import {MatchTextColorModule} from '@kolory/angular-text-color-to-background-match'

@NgModule({
  ...
  import: [MatchTextColorModule, ...],
})
class App {}

// 2. Use in a component. For more advanced use case, refer to the __TODO__
@Component({
  template: `<div [match-text-color-to-background]="backgroundColor"> ... </div>`
})
class MyComponent {
  backgroundColor = '#FFFFFF'
}
```

## Inputs and events

Directive can be configured using these input attributes:
- `match-text-color-to-background: string | Color` (required) - current value of the background color,
- `lightColor: string | Color` (optional) - text color used when the background is dark (white by default),
- `darkColor: string | Color` (optional) - text color used when the background is dark (black by default).

All inputs accepts either a valid color (in hex, RGB or HSL format) or
a [Color object](https://github.com/kolory/color-utilities#color-object)

When the text color is changed, directive emits the `colorChange` event with the matched color (as a Color object).

## Classes on the host element

Directive adds one of the two classes to the host element, depending on the type of color that was matched:
- `matched-light` when a light color was selected,
- `matched-dark` when a dark color was selected.

The reason for those classes is to add the ability to style other elements inside the directive's host by using
just the CSS rules in the stylesheet.
