import { LightningElement, track, api } from 'lwc';
import { fireEvent } from 'c/pubsub';
import getSelectedAndNearbyStoresInfo from "@salesforce/apex/AppointmentIntegrationServices.getSelectedAndNearbyStoresList";

export default class lwc_CarCareServiceStoreLocatorComp extends LightningElement {
    @api storeWrapperList = [];
    @api branchId = '';
    @api displayStoreChangeAlert = false;
    newBranchId = '';
    storeRecordId = '';

    @track newStoreSelection = '';
    @track isLoading = true;
    @track error = '';

    @track isOpenModal = false;
    @track showNearbyStore = false;
 
   
    

    connectedCallback() {
        //console.log('this.storeWrapperList '+(this.storeWrapperList === []));
        //console.log('this.storeWrapperList '+(this.storeWrapperList === undefined));
       // console.log('this.storeWrapperList '+(this.storeWrapperList.length === 0));
        //console.log('this.storeWrapperList '+(this.storeWrapperList === ''));
       // console.log('this.storeWrapperList '+(this.storeWrapperList === null));
        if(this.storeWrapperList === undefined || this.storeWrapperList === [] || this.storeWrapperList.length === 0){
           // console.log('branchId'+this.storeWrapperList.length);
            this.getStoreInfo();
        }
        else{
            this.isLoading = false;
        }
    }

    getDayNameList(){
        return ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    }

    getStoreInfo() {
        this.isLoading = true;
        getSelectedAndNearbyStoresInfo({ branchId: this.branchId })
            .then(result => {
                //console.log(JSON.parse(JSON.stringify(result)));
                const storeInfoTemp = [];
                if (result !== undefined) {
                    result.forEach(element => {
                        let storeOpeningTimings = '';
                        //TODO : Need to work this at later part - Start
                        if(element.storeHours !== undefined){
                            let now = new Date();
                            let dayName = this.getDayNameList()[now.getDay()];
                            
                            for(let i = 0 ; i < element.storeHours.length  ; i++){
                                if(dayName === element.storeHours[i].day){
                                    storeOpeningTimings = element.storeHours[i].day + ' open ' + element.storeHours[i].hours; 
                                    break;
                                }
                                //storeOpeningTimings = storeOpeningTimings + element.storeHours[i].day + ' open ' + element.storeHours[i].hours +' \n ';
                            }
                        }
                        //TODO : Need to work this at later part - END
                        //console.log('element.branchId '+element.branchId+' ==== this.branchId '+this.branchId);
                        let isEqualCheck = isNaN(element.branchId) === false && isNaN(this.branchId) === false 
                                            ? Number(element.branchId) === Number(this.branchId) 
                                            : false;
                        //console.log('isEqualCheck '+isEqualCheck);
                        let selectOption = {
                            id: element.id,
                            branchId : element.branchId,
                            name: element.street1 +', '+ element.city +', '+ element.state +' '+ element.zip ,
                            phone : element.phone,
                            phoneHref : 'tel:'+element.phone,
                            isSelected: isEqualCheck,
                            isNotSelected: isEqualCheck !== true,
                            isDisabled : isEqualCheck,
                            openingTimings : storeOpeningTimings 
                        };
                        storeInfoTemp.push(selectOption);
                        
                        if(isEqualCheck){
                            this.storeRecordId =  element.id;
                        }
                    
                    });
                }
                this.storeWrapperList = storeInfoTemp;
                //this.showNearbyStore = true;
                this.isLoading = false;
                this.error = undefined;
                //console.log(JSON.parse(JSON.stringify(this.storeWrapperList)));
            })
            .catch(error => {
                this.error = error;
                this.selectedStoreInfo = undefined;
                this.isLoading = false;
            });
        
    }

   

    get isLoaded() {
        return this.isLoading ? false : true;
    }

    @api
    getSelectedStoreObjInfo(reload) {
        //console.log('getSelectedStoreObjInfo   : '+reload);
        if(reload){
            //console.log('In Reload  this.storeRecordId  : '+this.storeRecordId+'  this.branchId   :'+this.branchId);
            this.getStoreInfo();
        }
        return this.storeWrapperList;
    }

    @api
    getSelectedStoreId() {
        return this.storeRecordId;
    }

    onStoreSelection(event){
        //console.log('onStoreSelection Id : '+event.target.dataset.id);
       // console.log('onStoreSelection branchId : '+event.target.dataset.branchId);
        console.log('##################### displayStoreChangeAlert : '+this.displayStoreChangeAlert);
        this.newBranchId = event.target.dataset.branchId;
        this.storeRecordId = event.target.dataset.id;
        
        if(this.displayStoreChangeAlert){
            this.isOpenModal = true;
        }
        else{
            this.handleContinueModal(event);
        }
        
    }

    handleCloseModal() {
        this.isOpenModal = false;
    }

    handleContinueModal(event){
        //console.log( 'handleContinueModal this.newBranchId : '+this.newBranchId);
        //console.log( 'handleContinueModal this.storeRecordId : '+this.storeRecordId);
        this.branchId = this.newBranchId;
        this.handleCloseModal();
        let selectedStore = {
            _branchId : this.branchId,
            _storeRecordId : this.storeRecordId 
        };
        //fireEvent(this.pageRef, 'storeChangeRequested', selectedStore);
        // Creates the event with the contact ID data.
        const selectedEvent = new CustomEvent('storechange', { detail: selectedStore });
        // Dispatches the event.
        this.dispatchEvent(selectedEvent);
    }
/*
    get displayNearbyStore(){
        //this.showNearbyStore = this.showNearbyStore === true ? true : this.showNearbyStore; 
        return this.showNearbyStore;
    }*/
}