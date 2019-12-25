import { LightningElement, track, api } from 'lwc';
import getNearByStoreInfoList from "@salesforce/apex/AppointmentIntegrationServices.getNearByStoreList";
import getStoreDetailsInfo from "@salesforce/apex/AppointmentIntegrationServices.getStoreInfo";

export default class lwc_CarCareServiceStoreLocatorComp extends LightningElement {
    @api storeWrapperList = [];
    @api storeId = '';
    newStoreId = '';

    @track newStoreSelection = '';
    @track isLoading = true;
    @track error = '';

    @track isOpenModal = false;
 
   
    

    connectedCallback() {
        if(this.storeWrapperList === undefined || this.storeWrapperList === []){
            this.getSelectedStoreInfo();
        }
        
    }

    getDayNameList(){
        return ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    }

    getSelectedStoreInfo() {
        this.isLoading = true;
        getStoreDetailsInfo({ storeId: this.storeId })
            .then(result => {
                console.log(JSON.parse(JSON.stringify(result)));
                const storeInfoTemp = [];
                

                let deleteElementId = '';
                if (result !== undefined) {
                    result.forEach(element => {
                        let storeOpeningTimings = '';
                        console.log('deleteElementId'+deleteElementId);
                            console.log(' element.id '+ element.id);
                        if(deleteElementId !== element.id){
                            
                            if(element.storeHours !== undefined){
                                let now = new Date();
                                //console.log('now : '+now);
                                //console.log(JSON.parse(JSON.stringify(this.getDayNameList())));
                                //console.log('now.getDay() : '+now.getDay());
                                let dayName = this.getDayNameList()[now.getDay()];
                                
                                //console.log('dayName : '+dayName);
                                for(let i = 0 ; i < element.storeHours.length  ; i++){
                                    //console.log('element.storeHours[i] : ')
                                    //console.log(JSON.parse(JSON.stringify(element.storeHours[i].day)));
                                    /*
                                    if(dayName === element.storeHours[i].day){
                                        //console.log(' element.storeHours[i].hours '+ element.storeHours[i].hours);
                                        storeOpeningTimings = element.storeHours[i].day + ' open ' + element.storeHours[i].hours; 
                                        break;
                                    }*/
                                    storeOpeningTimings = storeOpeningTimings + element.storeHours[i].day + ' open ' + element.storeHours[i].hours +' \n ';
                                }
                            }
                            //console.log('storeOpeningTimings : '+storeOpeningTimings);
                            //console.log('element.id : '+element.id);
                            //console.log('this.storeId : '+this.storeId);
                            //console.log('this.storeId : '+(element.id === this.storeId));
                            let isEqualCheck = isNaN(element.id) === false && isNaN(this.storeId) === false 
                                                ? Number(element.id) === Number(this.storeId) 
                                                : false;

                            console.log('isEqualCheck : '+isEqualCheck);                    
                            let selectOption = {
                                id: element.id,
                                name: element.street1 +', '+ element.city +', '+ element.state +' '+ element.zip ,
                                phone : element.phone,
                                isSelected: isEqualCheck,
                                isDisabled : isEqualCheck,
                                openingTimings : storeOpeningTimings 
                            };
                            deleteElementId = element.id;
                            storeInfoTemp.push(selectOption);
                            
                        }
                    });
                }
                this.storeWrapperList = storeInfoTemp;
                this.isLoading = false;
                this.error = undefined;
                console.log(JSON.parse(JSON.stringify(this.storeWrapperList)));
            })
            .catch(error => {
                this.error = error;
                this.selectedStoreInfo = undefined;
                this.isLoading = false;
            });
        
    }

    /*
    getNearByStoreList() {
        
        getNearByStoreInfoList({ branchId : this.storeIdOfStoreLocator })
            .then(result => {
                console.log(JSON.parse(JSON.stringify(result)));
                const availableServicesTemp = [];
                if (result.items !== undefined) {
                    result.items.forEach(element => {
                        if (element.isPackage !== true) {
                            let selectOption = {
                                id: element.id,
                                name: element.name,
                                isSelected: false
                            };
                            availableServicesTemp.push(selectOption);
                        }
                    });
                }
                this.availableServices = availableServicesTemp;
                this.isLoading = false;
                this.error = undefined;
            })
            .catch(error => {
                this.error = error;
                this.availableServices = undefined;
                this.isLoading = false;
            });
        
    }*/

    get isLoaded() {
        return this.isLoading ? false : true;
    }

    
    
    @api
    getSelectedStoreObjInfo() {
        return this.storeWrapperList;
    }

    onStoreSelection(event){
        console.log(event.target.dataset.id);
        this.isOpenModal = true;
        this.newStoreId = event.target.dataset.id;
    }

    handleCloseModal() {
        this.isOpenModal = false;
    }

    handleContinueModal(event){
        console.log( this.newStoreId);
        let newUrl = window.location.href.replace('StoreIdKey='+this.storeId, 'StoreIdKey='+this.newStoreId );
        window.location = newUrl; 
        //window.location.reload();
    }
}