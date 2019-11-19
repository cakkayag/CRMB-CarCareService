import { LightningElement, wire, track, api } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';
import { registerListener, unregisterAllListeners } from 'c/pubsub';

//import css from static resource
import carCareResources from '@salesforce/resourceUrl/CarCareReserveService';
import { loadStyle, loadScript } from 'lightning/platformResourceLoader';

export default class lwc_CarCareServiceHeaderComp extends LightningElement {

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

    @wire(CurrentPageReference) pageRef;
    @track CurrentPage = 1;
    
    //Exposed Variables
    @api storeLocatorHeader = '';
    @api storeLocatorSubHeader = '';
    @api storeLocatorDescription = '';
    @api contactInfoHeader = '';
    @api contactInfoSubHeader = '';
    @api contactInfoDescription = '';
    @api vehicleInfoHeader = '';
    @api vehicleInfoSubHeader = '';
    @api vehicleInfoDescription = '';
    @api selectServiceHeader = '';
    @api selectServiceSubHeader = '';
    @api selectServiceDescription = '';
    @api appointmentHeader = '';
    @api appointmentSubHeader = '';
    @api appointmentDescription = '';
    @api confirmationHeader = '';
    @api confirmationSubHeader = '';
    @api confirmationDescription = '';


    connectedCallback() {
        // subscribe to searchKeyChange event
        //console.log("buttonPressed registerListener done !!");
        registerListener('buttonClickedEvent', this.handleButtonPressedEvent, this);
        
    }

    disconnectedCallback() {
        // unsubscribe from searchKeyChange event
        unregisterAllListeners(this);
    }

    handleButtonPressedEvent(detail) {
        console.log('##detail.CurrentPage'+detail.CurrentPage);
        this.CurrentPage = detail.CurrentPage;
                //this.searchKey = searchKey;
    }

    get showFirstPage() {
        return this.CurrentPage === 1 ? true : false;
    }

    get showSecondPage() {
        return this.CurrentPage === 2 ? true : false;
    }

    get showThirdPage() {
        return this.CurrentPage === 3 ? true : false;
    }

    get showFourthPage() {
        return this.CurrentPage === 4 ? true : false;
    }

    get showFifthPage() {
        return this.CurrentPage === 5 ? true : false;
    }

    get showSixthPage() {
        return this.CurrentPage === 6 ? true : false;
    }
}