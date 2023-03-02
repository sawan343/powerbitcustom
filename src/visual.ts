/*
*  Power BI Visual CLI
*
*  Copyright (c) Microsoft Corporation
*  All rights reserved.
*  MIT License
*
*  Permission is hereby granted, free of charge, to any person obtaining a copy
*  of this software and associated documentation files (the ""Software""), to deal
*  in the Software without restriction, including without limitation the rights
*  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
*  copies of the Software, and to permit persons to whom the Software is
*  furnished to do so, subject to the following conditions:
*
*  The above copyright notice and this permission notice shall be included in
*  all copies or substantial portions of the Software.
*
*  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
*  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
*  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
*  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
*  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
*  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
*  THE SOFTWARE.
*/

"use strict";
import powerbi from "powerbi-visuals-api";
import { IBasicFilter, FilterType } from 'powerbi-models'

import DataView = powerbi.DataView;
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
import IVisualHost = powerbi.extensibility.visual.IVisualHost


import EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;
import VisualObjectInstanceEnumerationObject = powerbi.VisualObjectInstanceEnumerationObject;
import VisualObjectInstance = powerbi.VisualObjectInstance;
import { dataViewWildcard } from "powerbi-visuals-utils-dataviewutils"
import VisualEnumerationInstanceKinds = powerbi.VisualEnumerationInstanceKinds


// Import React dependencies and the added component
import * as React from "react";
import * as ReactDOM from "react-dom";
import TestReact from "./TestReact";
import { transformData, VData } from './tranformData';

import "./../style/visual.less";
import { VisualSettings } from "./settings";
import { setStyle } from './setstyle';


export class Visual implements IVisual {

    private target: HTMLElement;
    private reactRoot: any;
    private dataview:any;
    private data: VData
    private basicFilter: IBasicFilter
    private host: IVisualHost
    private n:number
    private settings: VisualSettings
    public slicerItems: HTMLElement



    constructor(options: VisualConstructorOptions) {
        this.target = options.element;
        this.host = options.host;
        this.data = null;
        this.basicFilter = null;
        this.n = 0;
        this.slicerItems =  document.createElement('ul');
    }

    private styleSelected(opt: VisualUpdateOptions) {
        const slicerItems = this.slicerItems.children
        const f = opt.jsonFilters
        if (f.length === 0) {
            slicerItems[0].children[0].classList.add('selected')
        } else {
            const selected = (<IBasicFilter>f[0]).values[0]
            for (let i = 0; i < slicerItems.length; i++) {
                const item = <HTMLElement>slicerItems[i].children[0]
                if (item.innerText === selected) {
                    slicerItems[i].children[0].classList.add('selected')
                }
            }
        }
    }

    public getnode(a:any) {
        console.log(a);
        console.log(this.slicerItems);
        this.slicerItems =  a;
    };

    public update(options: VisualUpdateOptions) {
        /**
         * 
         */
        //const value =  this.dataview.single.value
        this.settings = Visual.parseSettings(options && options.dataViews && options.dataViews[0])
        setStyle(this.settings);
        this.data = transformData(options);
        this.basicFilter = {
            $schema: 'https://powerbi.com/product/schema#basic',
            target: {
                table: this.data.table,
                column: this.data.column
            },
            operator: "In",
            values: null,
            filterType: FilterType.Basic
        }
        //this.basicFilter.values = ["BR"];
        if(this.n === 0 && this.data.values) {
            //this.host.applyJsonFilter(this.basicFilter, 'general', 'filter', powerbi.FilterAction.merge)
            this.n++

        }
        /**
         * 
         */

        this.dataview = options.dataViews[0];
        console.clear();
        console.log("Categories *********************************");
        
        this.dataview.categorical?.categories?.forEach(element => {
            console.info(element.values)
        });
        console.log("values *********************************");
        this.dataview.categorical?.values?.forEach(element => {
            console.info(element.values)
        });


        this.reactRoot = React.createElement(TestReact, {val: this.data.values, host: this.host, basicFilter: this.basicFilter, merge: powerbi.FilterAction.merge, nodeT: this.getnode.bind(this) });
        ReactDOM.render(this.reactRoot, this.target);
        //this.styleSelected(options);
    }

    private static parseSettings(dataView: DataView): VisualSettings {
        return <VisualSettings>VisualSettings.parse(dataView);
    }

    /**
     * This function gets called for each of the objects defined in the capabilities files and allows you to select which of the
     * objects and properties you want to expose to the users in the property pane.
     *
     */
    // public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstance[] | VisualObjectInstanceEnumerationObject {
    //     return VisualSettings.enumerateObjectInstances(this.settings || VisualSettings.getDefault(), options);
    // }
     /**
     * This function gets called for each of the objects defined in the capabilities files and allows you to select which of the
     * objects and properties you want to expose to the users in the property pane.
     *
     */
     public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstance[] | VisualObjectInstanceEnumerationObject {
        // return VisualSettings.enumerateObjectInstances(this.settings || VisualSettings.getDefault(), options);
        const objectName: string = options.objectName
        const objectEnumeration: VisualObjectInstance[] = []

        switch(objectName) {
            case 'slicerSettings':
                objectEnumeration.push({
                    objectName,
                    properties: {
                        defaultColor: this.settings.slicerSettings.defaultColor
                    },
                    selector: null
                })
                objectEnumeration.push({
                    objectName,
                    properties: {
                        allSelectedLabel: this.settings.slicerSettings.allSelectedLabel
                    },
                    selector: dataViewWildcard.createDataViewWildcardSelector(dataViewWildcard.DataViewWildcardMatchingOption.InstancesAndTotals),
                    altConstantValueSelector: "test default",
                    propertyInstanceKind: {
                        allSelectedLabel: VisualEnumerationInstanceKinds.ConstantOrRule
                    }
                })
                objectEnumeration.push({
                    objectName,
                    properties: {
                        fontSize: this.settings.slicerSettings.fontSize,
                        fontFamily: this.settings.slicerSettings.fontFamily
                    },
                    selector: null
                })
            break
        }

        return objectEnumeration
    }
}