import { LightningElement, wire, track } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';
import { fireEvent, registerListener, unregisterAllListeners } from 'c/pubsub';

export default class lwc_CarCareSericeBaseComp extends LightningElement {
    @wire(CurrentPageReference) pageRef;
    @track nextPage = 2;
    @track previousPage = 1 ;
    @track CurrentPage = 1;
    maxPages = 6;
    minPages = 1;
    @track contactInfo = {};
    //contactComp = this.template.querySelector('c-lwc_-car-care-service-contact-info-comp');

    handleContinue(event) {
        //console.log("nextPage"+this.nextPage);
        const contactComp = this.template.querySelector('c-lwc_-car-care-service-contact-info-comp');
        //console.log('contactComp');
        //console.log(contactComp);
        let validationStatus =  true;
        if(this.CurrentPage === 2){
            
            //validationStatus = contactComp.ValidateContactInfo(event) ;
            /*if(this.contactInfo !== {}){
                contactComp.setContactInfo(this.contactInfo);
            }*/
        }
        //console.log(" validationStatus : "+validationStatus);
        if(validationStatus){
            if(this.CurrentPage === 2){
                const contactTemp = contactComp.getContactInfo();
                this.contactInfo = JSON.parse(JSON.stringify(contactTemp))
                //console.log(" Base contactInfo : ");
                //console.log(this.contactInfo);
            }

            this.previousPage = this.CurrentPage;
            this.CurrentPage = this.nextPage ;
            this.nextPage = this.nextPage < this.maxPages ? this.nextPage + 1 : this.nextPage ;
            fireEvent(this.pageRef, 'buttonClickedEvent', this);
        }
        
    }

    handlePrevious(event) {
        //console.log("nextPage"+this.previousPage);
        //console.log(this.contactInfo);
        this.nextPage = this.CurrentPage ;
        this.CurrentPage = this.previousPage;
        this.previousPage = this.previousPage > this.minPages ? this.previousPage - 1 : this.previousPage ;
        /*if(this.CurrentPage === 2){
            //const contactComp = this.template.querySelector('c-lwc_-car-care-service-contact-info-comp');
            //console.log('contactComp');
            //console.log(contactComp);
            //contactComp.setContactInfo(this.contactInfo);
        }*/
        fireEvent(this.pageRef, 'buttonClickedEvent', this);
    }

    connectedCallback() {
        // subscribe to searchKeyChange event
        //console.log("buttonPressed registerListener done !!");
        registerListener('navigationClickedEvent', this.handleNavigationEvent, this);
        
    }

    disconnectedCallback() {
        // unsubscribe from searchKeyChange event
        unregisterAllListeners(this);
    }

    handleNavigationEvent(detail){
        //console.log('## Base Comp : handleNavigationEvent --  CurrentPage :'+detail);
        this.CurrentPage = detail;
        this.previousPage = this.CurrentPage > this.minPages ? this.CurrentPage - 1 : this.CurrentPage ;
        this.nextPage = this.CurrentPage < this.maxPages ? this.CurrentPage + 1 : this.CurrentPage ;
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
    

    get showPrevious() {
        return (this.CurrentPage > this.minPages) ? false : true;
    }

    get showContinue() {
        return (this.CurrentPage < this.maxPages) ? false : true;
    }

}