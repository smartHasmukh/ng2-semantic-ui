import {Component, ViewChild, HostBinding, ElementRef, HostListener, Input, ContentChildren, QueryList, ViewChildren, AfterContentInit, EventEmitter, Output, Renderer, TemplateRef, ViewContainerRef} from '@angular/core';
import {DropdownService} from '../dropdown/dropdown.service';
import {SearchService} from '../search/search.service';
import {readValue} from '../util/util';
import {PositioningService, PositioningPlacement} from '../util/positioning.service';
import {SuiDropdownMenu, SuiDropdownMenuItem} from '../dropdown/dropdown-menu';
import {SuiSelectOption} from './select-option';
import {Subscription} from 'rxjs';
import {element} from 'protractor';

export abstract class SuiSelectBase<T> implements AfterContentInit {
    public dropdownService:DropdownService;
    public searchService:SearchService<T>;

    @ViewChild(SuiDropdownMenu)
    protected _menu:SuiDropdownMenu;

    @ContentChildren(SuiSelectOption, { descendants: true })
    private _renderedOptions:QueryList<SuiSelectOption<T>>;

    private _renderedSubscriptions:Subscription[];

    // Sets the Semantic UI classes on the host element.
    // Doing it on the host enables use in menus etc.
    @HostBinding('class.ui')
    @HostBinding('class.selection')
    @HostBinding('class.dropdown')
    private _selectClasses:boolean;

    @HostBinding('class.active')
    public get isActive() {
        return this.dropdownService.isOpen;
    }

    @HostBinding('class.search')
    @Input()
    public isSearchable:boolean;

    @ViewChild('queryInput')
    private _queryInput:ElementRef;

    @Input()
    public placeholder:string;

    @Input()
    public set options(options:T[]) {
        this.searchService.options = options;
    }

    public get availableOptions() {
        return this.searchService.results;
    }

    public get query() {
        return this.searchService.query;
    }

    public set query(query:string) {
        this.searchService.updateQuery(query, () =>
            this.dropdownService.setOpenState(true));
    }

    @Input()
    public labelField:string;

    private get labelGetter() {
        return (obj:T) => readValue<T, string>(obj, this.labelField);
    }

    @Input()
    public optionTemplate:TemplateRef<any>;

    constructor(private _element:ElementRef, private _renderer:Renderer) {
        this.dropdownService = new DropdownService();
        this.searchService = new SearchService<T>(true);

        this.isSearchable = false;
        this.placeholder = "Select one";

        this._renderedSubscriptions = [];

        this._selectClasses = true;
    }

    public ngAfterContentInit() {
        this._menu.service = this.dropdownService;
        this._menu.items = this._renderedOptions;

        this.onAvailableOptionsRendered();
        this._renderedOptions.changes.subscribe(() => this.onAvailableOptionsRendered());
    }

    private onAvailableOptionsRendered() {
        this._renderedSubscriptions.forEach(rs => rs.unsubscribe());
        this._renderedSubscriptions = [];
        setTimeout(() => {
            this._renderedOptions.forEach(ro => {
                ro.usesTemplate = !!this.optionTemplate;
                ro.readLabel = this.labelGetter;

                if (ro.usesTemplate) {
                    this.drawTemplate(ro.templateSibling, ro.value);
                }

                this._renderedSubscriptions.push(ro.onSelected.subscribe(() => this.selectOption(ro.value)));
            });
        });
    }

    public selectOption(option:T) {
        throw new Error("Extend me!");
    }

    @HostListener("click", ['$event'])
    public onClick(e:MouseEvent) {
        e.stopPropagation();
        
        this._renderer.invokeElementMethod(this._queryInput.nativeElement, "focus");

        this.dropdownService.toggleOpenState();
    }

    protected drawTemplate(siblingRef:ViewContainerRef, value:T) {
        siblingRef.clear();
        siblingRef.createEmbeddedView(this.optionTemplate, { '$implicit': value });
    }
}