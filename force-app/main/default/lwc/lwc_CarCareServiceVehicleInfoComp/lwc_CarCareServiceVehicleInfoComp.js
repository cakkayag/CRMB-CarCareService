import { LightningElement, track, wire } from 'lwc';
import getAllVehicleMakeInfo from "@salesforce/apex/AppointmentIntegrationServices.getAllVehicleMakes";
import getAllVehicleModelsByMakeSelectedInfo from "@salesforce/apex/AppointmentIntegrationServices.getAllVehicleModelsByMakeSelected";
import getAllYears from "@salesforce/apex/AppointmentIntegrationServices.getYears";

export default class lwc_CarCareServiceVehicleInfoComp extends LightningElement {
    @track selectedYear;
    @track selectedMake;
    @track selectedModel;
    @track availableModelOptions;
    @track availableMakeOptions;
    @track availableYearOptions = [];
    @track isLoading;
    @track error;

    initialized = false;

    renderedCallback() {
        if (this.initialized) {
            return;
        }
        this.initialized = true;
        let listId = this.template.querySelector('datalist').id;
        this.template.querySelector("input").setAttribute("list", listId);
    }

    @wire(getAllYears)
    getAllAvailableYears({ error, data }) {
      if (data) {
          console.log(JSON.parse(JSON.stringify(data))); 
          
          const _availableYearOptions = [];
          if(data.items !== undefined){
              data.items.forEach(element => {
                  let selectOption = {
                    label : element,
                    value : element
                  }; 
                  _availableYearOptions.push(selectOption);
                    
              });
              console.log(JSON.parse(JSON.stringify(this.availableYearOptions)));  
          }
          this.availableYearOptions = _availableYearOptions;
          this.isLoading = false;
          this.error = undefined;
      } else if (error) {
          this.error = error;
          this.availableYearOptions = undefined;
          this.isLoading = false;
      }
    }

    get yearOptions() {
        return [
            { label: 'New', value: 'new' },
            { label: 'In Progress', value: 'inProgress' },
            { label: 'Finished', value: 'finished' },
        ];
    }

    get makeOptions() {
        return [
            { label: 'MERCEDES BENZ', value: 'MERCEDES BENZ' },
            { label: 'NISSAN', value: 'NISSAN' },
            { label: 'ISUZU', value: 'ISUZU' },
        ];
    }

    get modelOptions() {
        return [
            { label: 'C220', value: 'C220' },
            { label: 'C300', value: 'C300' },
            { label: 'E400 HYBRID', value: 'E400 HYBRID' },
        ];
    }

    handleYearChange(event) {
        this.selectedYear = event.detail.value;
        console.log('this.selectedYear : '+this.selectedYear);
        //this.getAllYearsOnSearch();
    }

    handleMakeChange(event) {
        this.selectedMake = event.detail.value;
        console.log('this.selectedYear : '+this.selectedMake);
        this.getAllVehicleMakeInfoOnSearch();
        
    }

    handleModelChange(event) {
        this.selectedModel = event.detail.value;
        this.getAllVehicleModelByMakeInfoOnSearch();
    }

    getAllVehicleMakeInfoOnSearch() {
        console.log('getAllVehicleMakeInfoOnSearch');
        console.log('this.selectedMake : '+this.selectedMake);
        let t0 = new Date().getTime();//performance.now();
        let t1; 
        let diffTime;
        console.log("Started on : " + t0);
        console.log("this.selectedMake.length : " + this.selectedMake.length);
        
        if (this.selectedMake !== undefined && this.selectedMake !== '' && this.selectedMake.length > 2 ) {
            this.isLoading = true;
          //this.availableServices = this.serviceSelect._availableServices;
          //this.serviceAdditionalInfo = this.serviceSelect._serviceAdditionalInfo;

          /*if ( this.availableServices === undefined ||
                this.availableServices.length === 0) {
*/
            getAllVehicleMakeInfo({ vehicleMakeStr : this.selectedMake })
              .then(result => {
                console.log(JSON.parse(JSON.stringify(result)));
                /*const availableServicesTemp = [];
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
                    //console.log(JSON.parse(JSON.stringify(this.availableServices)));
                  });
                }
                this.availableServices = availableServicesTemp;*/
                this.isLoading = false;
                this.error = undefined;
                t1 = new Date().getTime();//performance.now();
                var diffTime = t1-t0;
                console.log("Ended on : " + t1);
                console.log("diff : " + diffTime);
              })
              .catch(error => {
                this.error = error;
                this.availableServices = undefined;
                this.isLoading = false;
              });
          /*} else {
            this.isLoading = false;
          }*/
        } else {
          //this.availableServices = this.availableServicesObj;
          this.isLoading = false;
        }
    }

    getAllVehicleModelByMakeInfoOnSearch() {
        console.log('getAllVehicleModelByMakeInfoOnSearch');
        console.log(JSON.parse(JSON.stringify(this.selectedModel)))
        console.log(JSON.parse(JSON.stringify(this.selectedMake)));
        let t0 = new Date().getTime();//performance.now();
        let t1; 
        let diffTime;
        console.log("Started on : " + t0);
        console.log("this.serviceSelect : " + this.serviceSelect);
        console.log(" this.selectedModel : " + this.selectedModel);
        if (this.selectedModel !== undefined && this.selectedModel !== '' && this.selectedModel.length > 2
             && this.selectedMake !== undefined && this.selectedMake !== '' && this.selectedMake.length > 2)   {
                this.isLoading = true;
            getAllVehicleModelsByMakeSelectedInfo({ makeSelectedStr: this.selectedMake , modelStr : this.selectedModel })
                .then(result => {
                console.log(JSON.parse(JSON.stringify(result)));
                /*const availableServicesTemp = [];
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
                    //console.log(JSON.parse(JSON.stringify(this.availableServices)));
                    });
                }
                this.availableServices = availableServicesTemp;
                this.isLoading = false;
                this.error = undefined;
                t1 = new Date().getTime();//performance.now();
                var diffTime = t1-t0;
                console.log("Ended on : " + t1);
                console.log("diff : " + diffTime);
                })
                .catch(error => {
                this.error = error;
                this.availableServices = undefined;*/
                this.isLoading = false;
            });
            
        } else {
            //this.availableServices = this.availableServicesObj;
            this.isLoading = false;
        }
    }

    
    
    /*
    getAllYearsOnSearch() {
        console.log('getAllYearsOnSearch');
        console.log('this.selectedYear : '+this.selectedYear);
        
        let t0 = new Date().getTime();//performance.now();
        let t1; 
        let diffTime;
        console.log("Started on : " + t0);
        console.log("this.selectedModel : " + this.selectedModel);
        
        if (this.selectedModel === undefined || this.selectedModel !== '' || this.selectedModel.length > 2 ) {
            this.isLoading = true;
          //this.availableServices = this.serviceSelect._availableServices;
          //this.serviceAdditionalInfo = this.serviceSelect._serviceAdditionalInfo;

          if ( this.availableServices === undefined ||
                this.availableServices.length === 0) {

            getAllYears()
              .then(result => {
                console.log(JSON.parse(JSON.stringify(result)));
                /*const availableServicesTemp = [];
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
                    //console.log(JSON.parse(JSON.stringify(this.availableServices)));
                  });
                }
                this.availableServices = availableServicesTemp;
                this.isLoading = false;
                this.error = undefined;
                t1 = new Date().getTime();//performance.now();
                var diffTime = t1-t0;
                console.log("Ended on : " + t1);
                console.log("diff : " + diffTime);
              })
              .catch(error => {
                this.error = error;
                this.availableServices = undefined;
                this.isLoading = false;
              });
          } else {
            this.isLoading = false;
          }
        } else {
          //this.availableServices = this.availableServicesObj;
          this.isLoading = false;
        }
    }*/
}