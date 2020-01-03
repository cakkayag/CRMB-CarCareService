import { LightningElement, track, api } from "lwc";
import getAvailableServices from "@salesforce/apex/AppointmentIntegrationServices.getAllAvailableServices";

export default class lwc_CarCareServiceSelectComp extends LightningElement {
  //@api availableServicesObj = [];
  @api serviceSelect = {};
  @api storeId;

  @track availableServices = [];
  @track error;
  @track isLoading = true;
  @track serviceAdditionalInfo = "";
  @track hasError = false;
  isUpdated = false;

  connectedCallback() {
    //const param = 'storeId';
    //this.storeId = 1; //this.getUrlParamValue(window.location.href, param);
    this.getAvailableServicesByStore();
  }
  /*
    @wire(getAvailableServices, {storeId : '$storeId'})
    wiredAvailableServices({ error, data }) {
        if (data) {
            //console.log(JSON.parse(JSON.stringify(data))); 

            const availableServicesTemp = [];
            if(data.items !== undefined){
                data.items.forEach(element => {
                    let selectOption = {
                        id : element.id,
                        name : element.name ,
                        isSelected : false
                    }; 

                    availableServicesTemp.push(selectOption);
                    //console.log(JSON.parse(JSON.stringify(this.availableServices)));    
                });
            }
            this.availableServices = availableServicesTemp;
            this.isLoading = false;
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.availableServices = undefined;
            this.isLoading = false;
        }
    }*/

  getAvailableServicesByStore() {
    console.log('getAvailableServicesByStore');
    console.log(JSON.parse(JSON.stringify(this.availableServices)));
    let t0 = new Date().getTime();//performance.now();
    let t1; 
    let diffTime;
    //console.log("Started on : " + t0);
    console.log("this.serviceSelect : " + this.serviceSelect);
    console.log(JSON.parse(JSON.stringify(this.serviceSelect)));
    console.log(" this.storeId : " + this.storeId);

    this.serviceSelect = JSON.parse(JSON.stringify(this.serviceSelect));
    console.log("this.serviceSelect 2: " + this.serviceSelect);
    console.log("this.serviceSelect  check : " + (this.serviceSelect === {} ));
    console.log("this.serviceSelect  check : " + (JSON.stringify(this.serviceSelect) === JSON.stringify({})));
    if (this.serviceSelect === undefined || JSON.stringify(this.serviceSelect) === JSON.stringify({})) {
        console.log('In side');
        this.availableServices = this.serviceSelect._availableServices;
        this.serviceAdditionalInfo = this.serviceSelect._serviceAdditionalInfo;
        if(this.availableServices === undefined || this.availableServices.length <= 0){

        
          getAvailableServices({ storeId : this.storeId })
            .then(result => {
              console.log(JSON.parse(JSON.stringify(result)));
              const availableServicesTemp = [];
              if (result.items !== undefined) {
                console.log(JSON.parse(JSON.stringify(result.items)));
                result.items.forEach(element => {
                  console.log(JSON.parse(JSON.stringify(element)));
                  if (element.isPackage === undefined || element.isPackage !== true) {
                    console.log(element.isPackage);
                    let selectOption = {
                      id: element.id,
                      name: element.name,
                      isSelected: false
                    };
                    availableServicesTemp.push(selectOption);
                  }
                  //console.log(JSON.parse(JSON.stringify(availableServicesTemp)));
                });
              }
              this.availableServices = availableServicesTemp;
              this.isLoading = false;
              this.error = undefined;
              t1 = new Date().getTime();//performance.now();
              diffTime = t1-t0;
              console.log(JSON.parse(JSON.stringify(this.availableServices)));
              //console.log("Ended on : " + t1);
              //console.log("diff : " + diffTime);
            })
            .catch(error => {
              this.error = error;
              this.availableServices = undefined;
              this.isLoading = false;
              console.log('Error'+error);
            });
        }else{
          console.log('Inside Error');
          this.isLoading = false;
        }
    }
    else if(this.serviceSelect !== undefined){
      this.availableServices = this.serviceSelect._availableServices;
      this.serviceAdditionalInfo = this.serviceSelect._serviceAdditionalInfo;
      this.isLoading = false;
      console.log('Else');
    }
    else{
      this.isLoading = false;
      console.log('Else 2' );
    }
  }

  /*
    get services() {
        return [
            'Oil Change',
            'Tires',
            'Brakes',
            'Alignment',
            'Battery & Electrical',
            'Engine Diagnostic',
            'NC State Inspection',
            'A/C System'
        ];
        //return this.availableServices;
    }*/

  get isLoaded() {
    return this.isLoading ? false : true;
  }

  handleSelection(event) {
    //console.log(JSON.parse(JSON.stringify(event.target.value)));
    //console.log(JSON.parse(JSON.stringify(event.target.id)));
    const availableServicesTemp = JSON.parse(
      JSON.stringify(this.availableServices)
    );
    for (let serviceRec of availableServicesTemp) {
      if (serviceRec.name === event.target.value) {
        if (serviceRec.isSelected === false) {
          serviceRec.isSelected = true;
        } else {
          serviceRec.isSelected = false;
        }
        break;
      }
      //console.log(JSON.parse(JSON.stringify(serviceRec)));
    }
    this.availableServices = availableServicesTemp;
    this.isUpdated = true;
    //console.log(JSON.parse(JSON.stringify(this.availableServices)));
  }

  onTextAreaChange(event) {
    this.serviceAdditionalInfo = event.target.value;
    this.isUpdated = true;
  }
  /*
    @api
    ValidateServiceSelection(){
        let isValid = false;
        for (let serviceRec of this.availableServices) {
            if(serviceRec.isSelected === true){
                isValid = true;
                break;
            }
        }
        console.log('isValid : '+isValid);
        console.log('this.serviceAdditionalInfo : '+this.serviceAdditionalInfo);
        isValid = isValid ? isValid : this.serviceAdditionalInfo !== undefined && this.serviceAdditionalInfo !== '' ; 
        this.hasError = isValid ? false : true;
        return isValid;
    }
    */
  @api
  getServiceInfo() {
    let serviceSelectInfo = {
      _availableServices: this.availableServices,
      _serviceAdditionalInfo: this.serviceAdditionalInfo,
      _isUpdated : this.isUpdated 
    };

    return serviceSelectInfo;
  }
}