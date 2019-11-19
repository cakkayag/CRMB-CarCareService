import { LightningElement, api, track } from 'lwc';

//import css from static resource
import carCareResources from '@salesforce/resourceUrl/CarCareReserveService';
import { loadStyle } from 'lightning/platformResourceLoader';

export default class lwc_CarCareServiceContactInfoComp extends LightningElement {
    
    baseURL = 'https://github.com/trailheadapps/lwc-recipes/tree/master/force-app/main/default/';

    @api source;
    //@api showFirstName = false;
    //@api showLastName = false;
    //@api showEmail = false;
    //@api showMobile = false;

    @track firstName;
    @track lastName;
    @track email;
    @track mobile;

    get sourceURL() {
        return this.baseURL + this.source;
    }

    renderedCallback() {
        Promise.all([
            //loadScript(this, D3 + '/d3.v5.min.js'),
            loadStyle(this, carCareResources + '/css/reserveService.css'),
        ])
            .then(() => {
                
            })
            .catch(error => {
                // eslint-disable-next-line no-console
                console.log('--error--'+error);
            });
    }

    @api
    ValidateContactInfo(evt){
        const allValid = [...this.template.querySelectorAll('lightning-input')]
            .reduce((validSoFar, inputCmp) => {
                        inputCmp.reportValidity();
                        return validSoFar && inputCmp.checkValidity();
            }, true);
        if (allValid) {
            //continue;
        } else {
            //stop;
            evt.preventDefault();
            evt.stopPropagation();
        }
    }

}