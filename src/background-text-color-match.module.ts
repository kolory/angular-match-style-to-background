import {NgModule} from '@angular/core'
import {MatchTextColorDirective} from './background-text-color-match.directive'

@NgModule({
  declarations: [MatchTextColorDirective],
  exports: [MatchTextColorDirective]
})
export class MatchTextColorModule {}
