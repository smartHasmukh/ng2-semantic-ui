import {NgModule} from '@angular/core';
import {CommonModule} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {SuiDropdownModule} from "../dropdown/dropdown.module";
import {SuiSearchModule} from "../search/search.module";
import {SUI_SELECT_DIRECTIVES} from "./select";
import {SuiTransitionModule} from "../transition/transition.module";

import {SuiSelect} from '../select-new/select';
import {SuiSelectOption} from '../select-new/select-option';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        SuiDropdownModule
    ],
    declarations: [
        SuiSelect,
        SuiSelectOption,
    ],
    exports: [
        SuiSelect,
        SuiSelectOption,
    ]
})
export class SuiSelectModule {}
