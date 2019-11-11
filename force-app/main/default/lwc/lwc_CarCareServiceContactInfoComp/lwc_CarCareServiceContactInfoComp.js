import { LightningElement, api } from 'lwc';

export default class lwc_CarCareServiceContactInfoComp extends LightningElement {
    
    baseURL = 'https://github.com/trailheadapps/lwc-recipes/tree/master/force-app/main/default/';

    @api source;

    get sourceURL() {
        return this.baseURL + this.source;
    }

}