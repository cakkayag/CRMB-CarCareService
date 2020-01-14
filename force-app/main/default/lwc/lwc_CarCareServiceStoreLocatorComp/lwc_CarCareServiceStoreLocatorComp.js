import { LightningElement, track, api } from 'lwc';
//import { fireEvent } from 'c/pubsub';
import getSelectedAndNearbyStoresInfo from "@salesforce/apex/AppointmentIntegrationServices.getSelectedAndNearbyStoresList";
import carCareResources from '@salesforce/resourceUrl/CarCareReserveService';
import { loadStyle } from 'lightning/platformResourceLoader';
//import strUserId from '@salesforce/user/Id';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class lwc_CarCareServiceStoreLocatorComp extends LightningElement {
    @api storeWrapperList = [];
    @api branchId = '';
    @api displayStoreChangeAlert = false;
    newBranchId = '';
    storeRecordId = '';
    @api selectedStoreObj = {};

    @track newStoreSelection = '';
    @track isLoading = true;
    @track error = '';

    @track displayStoreModal = false;
    @track displayStoreClosedModal = false;
    @track showNearbyStore = false;
    hasRendered = false;
    //@track userName ='test';
    
    @track showStoreDetail = false;
    @track isSelectedStoreClosed = false;
    @track storeInfoForDisplay = {};

    renderedCallback() {
        if(!this.hasRendered){
            
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
        else{
            this.hasRendered = true;
        }

        
        
    }
    

    connectedCallback() {
        //console.log('this.storeWrapperList '+(this.storeWrapperList === []));
        //console.log('this.storeWrapperList '+(this.storeWrapperList === undefined));
       // console.log('this.storeWrapperList '+(this.storeWrapperList.length === 0));
        //console.log('this.storeWrapperList '+(this.storeWrapperList === ''));
       // console.log('this.storeWrapperList '+(this.storeWrapperList === null));
        if(this.storeWrapperList === undefined || this.storeWrapperList === [] || this.storeWrapperList.length === 0){
           //console.log('branchId'+this.storeWrapperList.length);
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
        //console.log('--before call to apex--'+this.branchId);
        //this.userName = strUserId;
        //console.log('--before call to apex--'+strUserId);
        console.log('--before call to apex--'+this.userName);
        getSelectedAndNearbyStoresInfo({ branchId: this.branchId })
            .then(result => {
                console.log(JSON.parse(JSON.stringify(result)));
                const storeInfoTemp = [];
                if (result !== undefined) {
                    let now = new Date();
                    let dayName = this.getDayNameList()[now.getDay()];
                    result.forEach(element => {
                        let storeOpeningTimings = '';
                        let storeTimingsMap = [];
                        //TODO : Need to work this at later part - Start
                        //console.log('element.storeHours : '+element.storeHours);
                        if(element.storeHours !== undefined){
                            for(let i = 0 ; i < element.storeHours.length  ; i++) {
                                if(element.storeHours[i].day !== undefined) {
                                    storeTimingsMap.push({key:element.storeHours[i].day, value:element.storeHours[i].hours});
                                }
                            }
                            console.log('storeTimingsMap : '+JSON.stringify(storeTimingsMap));
                            for(let i = 0 ; i < element.storeHours.length  ; i++){
                                //console.log('element.storeHours[i].day : '+element.storeHours[i].day);
                                if(element.storeHours[i].day !== undefined && dayName.toUpperCase() === element.storeHours[i].day.toUpperCase()){
                                    storeOpeningTimings = element.storeHours[i].day + ' open ' + element.storeHours[i].hours; 
                                    break;
                                }
                                
                                //storeOpeningTimings = storeOpeningTimings + element.storeHours[i].day + ' open ' + element.storeHours[i].hours +' \n ';
                            }
                        }
                        //console.log('storeOpeningTimings : '+storeOpeningTimings);
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
                            url : element.url,
                            imageUrl : element.imageUrl,
                            status : element.status,
                            isSelected: isEqualCheck,
                            isNotSelected: isEqualCheck !== true,
                            isDisabled : isEqualCheck,
                            openingTimings : storeOpeningTimings,
                            storeTimingsMap : storeTimingsMap
                        };
                        
                        if(isEqualCheck){
                            this.storeRecordId =  element.id;
                            this.selectedStoreObj = selectOption;
                            if(element.status === undefined || element.status.toUpperCase() !== 'Open'.toUpperCase()){
                                this.isSelectedStoreClosed = true;
                                this.displayStoreClosedModal = true;
                            }
                            storeInfoTemp.push(selectOption);
                        }
                        else{
                            if(element.status !== undefined && element.status.toUpperCase() === 'Open'.toUpperCase()){
                                storeInfoTemp.push(selectOption);
                            }
                            this.showNearbyStore = true;
                        }
                    
                    
                    });
                }
                this.storeWrapperList = storeInfoTemp;
                
                this.isLoading = false;
                this.error = undefined;
                //console.log(JSON.parse(JSON.stringify(this.storeWrapperList)));
            })
            .catch(error => {
                this.error = error;
                this.selectedStoreInfo = undefined;
                this.isLoading = false;
                this.showToast('Error' , 'Error Occured while fetching Store Info ( '+this.error+' ), Please contact Support team' , 'Error', 'sticky'  );
            });
        
    }

   

    get isLoaded() {
        return this.isLoading ? false : true;
    }

    @api
    getSelectedStoreObjInfo(reload) {
        //console.log('getSelectedStoreObjInfo reload status   : '+reload);
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

    @api
    getSelectedStoreObj(){
        return this.selectedStoreObj;
    }

    onStoreSelection(event){
        //console.log('onStoreSelection Id : '+event.target.dataset.id);
       // console.log('onStoreSelection branchId : '+event.target.dataset.branchId);
        //console.log('##################### displayStoreChangeAlert : '+this.displayStoreChangeAlert);
        this.newBranchId = event.target.dataset.branchId;
        this.storeRecordId = event.target.dataset.id;
        
        if(this.displayStoreChangeAlert){
            this.displayStoreModal = true;
        }
        else{
            this.handleContinueModal(event);
        }
        
    }

    handleCloseModal() {
        this.displayStoreModal = false;
    }

    handleClosedStoreCloseModal() {
        this.displayStoreClosedModal = false;
    }

    handleContinueModal(){
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

    showStoreDetailModal(event){
        let BranchId = event.target.dataset.branchId;
        for(let i=0 ; i < this.storeWrapperList.length ; i++ ){
            if(BranchId === this.storeWrapperList[i].branchId){
                this.storeInfoForDisplay = this.storeWrapperList[i];
                break;
            }
        }
        this.showStoreDetail = true;
    }
    
    closeStoreDetailModal(){
        this.showStoreDetail = false;
        this.storeInfoForDisplay = {};
    }

    get displayClosedStoreWithNearByStore(){
        return this.isSelectedStoreClosed && this.showNearbyStore ? true : false;
    }

    get displayClosedStoreWithOutNearByStore(){
        return this.isSelectedStoreClosed && this.showNearbyStore === false ? true : false;
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

}