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
    
    connectedCallback() {
        // subscribe to searchKeyChange event
        registerListener('navigationClickedEvent', this.handleNavigationEvent, this);
    }

    disconnectedCallback() {
        // unsubscribe from searchKeyChange event
        unregisterAllListeners(this);
    }


    handleContinue(event) {
        const contactComp = this.template.querySelector('c-lwc_-car-care-service-contact-info-comp');
        let validationStatus =  true;
        if(this.CurrentPage === 2){
            validationStatus = contactComp.ValidateContactInfo(event) ;
        }
        console.log(" validationStatus : "+validationStatus);
        if(validationStatus){
            if(this.CurrentPage === 2){
                
                const contactTemp = contactComp.getContactInfo();
                this.contactInfo = JSON.parse(JSON.stringify(contactTemp))
            }

            this.previousPage = this.CurrentPage;
            this.CurrentPage = this.nextPage ;
            this.nextPage = this.nextPage < this.maxPages ? this.nextPage + 1 : this.nextPage ;
            fireEvent(this.pageRef, 'buttonClickedEvent', this);
        }
        
    }

    handlePrevious(event) {
        
        
        if(this.CurrentPage === 2){
            const contactComp = this.template.querySelector('c-lwc_-car-care-service-contact-info-comp');
            const contactTemp = contactComp.getContactInfo();
            this.contactInfo = JSON.parse(JSON.stringify(contactTemp))
        }
        this.nextPage = this.CurrentPage ;
        this.CurrentPage = this.previousPage;
        this.previousPage = this.previousPage > this.minPages ? this.previousPage - 1 : this.previousPage ;
        
        fireEvent(this.pageRef, 'buttonClickedEvent', this);
    }

    
    handleNavigationEvent(navWrap){
        const contactComp = this.template.querySelector('c-lwc_-car-care-service-contact-info-comp');
        let validationStatus =  true;
        if(navWrap.pSelection === 2 && navWrap.cSelection > 2){
            validationStatus = contactComp.ValidateContactInfo(null) ;
        }
        console.log(" validationStatus : "+validationStatus);
        if(validationStatus){
            if(navWrap.pSelection === 2){
                const contactComp = this.template.querySelector('c-lwc_-car-care-service-contact-info-comp');
                const contactTemp = contactComp.getContactInfo();
                this.contactInfo = JSON.parse(JSON.stringify(contactTemp))
            }

            this.CurrentPage = navWrap.cSelection;
            this.previousPage = this.CurrentPage > this.minPages ? this.CurrentPage - 1 : this.CurrentPage ;
            this.nextPage = this.CurrentPage < this.maxPages ? this.CurrentPage + 1 : this.CurrentPage ;
        }
        else{
            fireEvent(this.pageRef, 'buttonClickedEvent', this);    
        }

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