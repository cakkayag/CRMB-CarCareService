import { LightningElement, wire, track, api } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';
import { fireEvent, registerListener, unregisterAllListeners } from 'c/pubsub';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
export default class lwc_CarCareSericeBaseComp extends LightningElement {
    @wire(CurrentPageReference) pageRef;
    @track nextPage = 2;
    @track previousPage = 1 ;
    @track CurrentPage = 1;
    maxPages = 6;
    minPages = 1;
    @track contactInfo = {};
    @track serviceSelectInfo = [];
    @track uniqueUrlKey = 'branchId';
    @track branchIdVal = '';
    @track vehicleInfo = {};
    @track storeId = '';
    @track availableStoreList = [];
    //@track isChildLoading = false;
    

    connectedCallback() {
        /*Handling Changes related to pages when clicked specific tile of Navigation  
        registerListener('navigationClickedEvent', this.handleNavigationEvent, this);*/
        //registerListener('storeChangeRequested', this.handleStoreChange, this);
        //console.log(" this.storeIdUrlKey  : "+this.storeIdUrlKey);
        //console.log(" this.storeIdVal : "+this.storeIdVal);
        this.branchIdVal = this.getUrlParamValue(window.location.href, this.uniqueUrlKey);
        if(this.branchIdVal  === undefined || this.branchIdVal === '' || this.branchIdVal === null ){
            this.showToast('Error' , 'Missing valid '+this.uniqueUrlKey+' key in url, Please contact Support team' , 'Error', 'sticky'  );
        }
    }

    disconnectedCallback() {
        // unsubscribe from searchKeyChange event
        //unregisterAllListeners(this);
    }

    handleStoreChange(event){
        console.log(JSON.parse(JSON.stringify(event)));
        console.log('handleStoreChange'+event.detail._branchId+'   detail._storeRecordId  '+event.detail._storeRecordId);
        this.branchIdVal = event.detail._branchId;
        this.storeId = event.detail._storeRecordId;
        const storeInfoComp = this.template.querySelector('c-lwc_-car-care-service-store-locator-comp');
        const _availableStoreList = storeInfoComp.getSelectedStoreObjInfo(true);
        this.availableStoreList = JSON.parse(JSON.stringify(_availableStoreList));
        
    }


    handleContinue(event) {
        const contactComp = this.template.querySelector('c-lwc_-car-care-service-contact-info-comp');
        const sericeSelectComp = this.template.querySelector('c-lwc_-car-care-service-select-comp');
        const vehicleInfoComp = this.template.querySelector('c-lwc_-car-care-service-vehicle-info-comp');
        const storeInfoComp = this.template.querySelector('c-lwc_-car-care-service-store-locator-comp');

        let validationStatus =  true;
        if(this.CurrentPage === 2){
            validationStatus = contactComp.ValidateContactInfo(event) ;
        }
        else if(this.CurrentPage === 4){
            //validationStatus = sericeSelectComp.ValidateServiceSelection(event) ;
        }
        //console.log(" validationStatus : "+validationStatus);
        if(validationStatus){
            if(this.CurrentPage === 1){
                const _availableStoreList = storeInfoComp.getSelectedStoreObjInfo(false);
                this.availableStoreList = JSON.parse(JSON.stringify(_availableStoreList));
                this.storeId = storeInfoComp.getSelectedStoreId();
                console.log("handleContinue "+this.storeId);
                console.log(JSON.parse(JSON.stringify(this.availableStoreList)));
            }
            else if(this.CurrentPage === 2){
                const contactTemp = contactComp.getContactInfo();
                this.contactInfo = JSON.parse(JSON.stringify(contactTemp));
                //console.log(JSON.parse(JSON.stringify(this.contactInfo)));
            }
            else if(this.CurrentPage === 3){
                const vehicleTemp= vehicleInfoComp.getVehicleDetailsInfo();
                this.vehicleInfo = JSON.parse(JSON.stringify(vehicleTemp));
                console.log(' this.vehicleInfo : '+JSON.parse(JSON.stringify(this.vehicleInfo)));
            }
            else if(this.CurrentPage === 4){
                
                const serviceSelectInfoTemp = sericeSelectComp.getServiceInfo();
                this.serviceSelectInfo = JSON.parse(JSON.stringify(serviceSelectInfoTemp));
                //console.log(JSON.parse(JSON.stringify(this.serviceSelectInfo))); 
            }

            this.previousPage = this.CurrentPage;
            this.CurrentPage = this.nextPage ;
            this.nextPage = this.nextPage < this.maxPages ? this.nextPage + 1 : this.nextPage ;
            
            /*if(this.CurrentPage === 4){
                this.isChildLoading = true;
            }*/
            fireEvent(this.pageRef, 'buttonClickedEvent', this);
        }
        
    }

    handlePrevious(event) {
        
        
        if(this.CurrentPage === 2){
            const contactComp = this.template.querySelector('c-lwc_-car-care-service-contact-info-comp');
            const contactTemp = contactComp.getContactInfo();
            this.contactInfo = JSON.parse(JSON.stringify(contactTemp))
        }
        else if(this.CurrentPage === 3){
            const vehicleInfoComp = this.template.querySelector('c-lwc_-car-care-service-vehicle-info-comp');
            const vehicleTemp= vehicleInfoComp.getVehicleDetailsInfo();
            console.log(JSON.parse(JSON.stringify(vehicleTemp)));
            this.vehicleInfo = JSON.parse(JSON.stringify(vehicleTemp));
            console.log(' this.vehicleInfo : ');
            console.log(JSON.parse(JSON.stringify(this.vehicleInfo)));
        }
        else if(this.CurrentPage === 4){
            const sericeSelectComp = this.template.querySelector('c-lwc_-car-care-service-select-comp');
            const serviceSelectInfoTemp = sericeSelectComp.getServiceInfo();
            this.serviceSelectInfo = JSON.parse(JSON.stringify(serviceSelectInfoTemp));
            //console.log(JSON.parse(JSON.stringify(this.serviceSelectInfo)));
        }
        //console.log("handlePrevious");
        // 
        this.nextPage = this.CurrentPage ;
        this.CurrentPage = this.previousPage;
        this.previousPage = this.previousPage > this.minPages ? this.previousPage - 1 : this.previousPage ;
        
        fireEvent(this.pageRef, 'buttonClickedEvent', this);
    }

    /*
    handleNavigationEvent(navWrap){
        const contactComp = this.template.querySelector('c-lwc_-car-care-service-contact-info-comp');
        let validationStatus =  true;
        if(navWrap.pSelection === 2 && navWrap.cSelection > 2){
            validationStatus = contactComp.ValidateContactInfo(null) ;
        }
        //console.log(" validationStatus : "+validationStatus);
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
    */
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

    

    showToast(title , message , variant , mode){
        const evt = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
            mode: mode
        });
        this.dispatchEvent(evt);
    }

    getUrlParamValue(url, key) {
        return new URL(url).searchParams.get(key);
    }

}