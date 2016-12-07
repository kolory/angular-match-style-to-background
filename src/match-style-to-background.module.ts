import {NgModule} from '@angular/core'
import {MatchStyleDirective} from './match-style-to-background.directive'
import {ColorUtilities} from '@kolory/color-utilities'

@NgModule({
  providers: [ColorUtilities],
  declarations: [MatchStyleDirective],
  exports: [MatchStyleDirective]
})
export class MatchStyleModule {}
