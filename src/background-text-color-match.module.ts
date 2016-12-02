import {NgModule} from '@angular/core'
import {MatchTextColorDirective} from './background-text-color-match.directive'
import {ColorUtilities} from '@radiatingstar/color-utilities'

@NgModule({
  providers: [ColorUtilities],
  declarations: [MatchTextColorDirective],
  exports: [MatchTextColorDirective]
})
export class MatchTextColorModule {}
