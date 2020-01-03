import { LightningElement, track, wire, api } from 'lwc';
import getAllVehicleMakeInfo from "@salesforce/apex/AppointmentIntegrationServices.getAllVehicleMakes";
import getAllVehicleModelsByMakeSelectedInfo from "@salesforce/apex/AppointmentIntegrationServices.getAllVehicleModelsByMakeSelected";
import getAllYears from "@salesforce/apex/AppointmentIntegrationServices.getYears";

export default class lwc_CarCareServiceVehicleInfoComp extends LightningElement {
    
    @api vehicleInfoRec={}

    @track selectedYear = '';
    @track selectedMake = '';
    @track selectedModel = '';
    @track availableModelOptions = [];
    @track availableMakeOptions = [];
    @track availableYearOptions = [];
    @track isLoading = true;
    @track error;

    hasRendered = true;

    
    renderedCallback() {
      console.log('this.hasRendered : '+this.hasRendered);  
      if (this.hasRendered) {
        
        
        if(this.template.querySelector('.yearsValueList') != null) {
          //console.log('--availableYearOptions--'+JSON.stringify(this.availableYearOptions));
          //console.log('--availableMakeOptions--'+JSON.stringify(this.availableMakeOptions));
          //console.log('--availableModelOptions--'+JSON.stringify(this.availableModelOptions));
          //console.log('--availableModelOptions--'+JSON.stringify(this.availableModelOptions));
        let yearsListId = this.template.querySelector('.yearsValueList').id;
        this.template.querySelector(".yearsInput").setAttribute("list", yearsListId);

        let makeListId = this.template.querySelector('.makeValueList').id;
        this.template.querySelector(".makeInput").setAttribute("list", makeListId);

        let modelListId = this.template.querySelector('.modelValueList').id;
        this.template.querySelector(".modelInput").setAttribute("list", modelListId);

        console.log('   renderedCallback vehicleInfoRec ');
        console.log(JSON.parse(JSON.stringify(this.vehicleInfoRec)));
        console.log('this.vehicleInfoRec !== {} '+(this.vehicleInfoRec !== {}));
        if(this.vehicleInfoRec !== undefined && this.vehicleInfoRec !== {}){
          this.vehicleInfoRec = JSON.parse(JSON.stringify(this.vehicleInfoRec))
            this.setVehicleInfoRecord(this.vehicleInfoRec);
        }
        this.hasRendered = false;
      }
          /*let datalistHtmlTagList = this.template.querySelectorAll('datalist');
          let inputHTMLTagList = this.template.querySelectorAll('lightning-input');
          console.log('datalistHtmlTagList : '+datalistHtmlTagList);
          console.log('datalistHtmlTagList.length : '+datalistHtmlTagList.length);
          if(datalistHtmlTagList !== undefined && datalistHtmlTagList.length > 0){
            console.log('datalistHtmlTagList !! '+JSON.parse(JSON.stringify(datalistHtmlTagList)));
            this.hasRendered = false;
            datalistHtmlTagList.forEach(datalistElement => {
              console.log('datalistElement.dataset '+datalistElement.dataset);
              console.log('datalistHtmlTagList !! '+JSON.parse(JSON.stringify(datalistElement.dataset)));
              //console.log(JSON.parse(JSON.stringify(datalistElement.getAttribute('data-name'))));
              //let elementName = datalistElement.getAttribute('data-name');
              //console.log(JSON.parse(JSON.stringify(elementName)));
              //console.log(JSON.parse(JSON.stringify(datalistElement.name)));
              console.log(JSON.parse(JSON.stringify(datalistElement.dataset)));
              console.log(JSON.parse(JSON.stringify(datalistElement.dataset.name)));
              //let datalistAttributeObj = datalistElement.dataset;
              if(datalistElement.dataset !== undefined){
                inputHTMLTagList.forEach(inputElement => {
                  console.log(JSON.parse(JSON.stringify(inputElement.name)));
                  //let elementName = inputElement.getAttribute('data-name');
                  if(inputElement !== undefined && 
                    inputElement.name === datalistElement.dataset.name ){
                    //TODO : logic to add id
                    inputElement.setAttribute("list", datalistElement.id);
                  }
                });
              }
              
          });
        }*/
      }
    }

    get isLoaded() {
      return this.isLoading ? false : true;
    }

    @api
    getVehicleDetailsInfo() {
      let vehicleDetailsInfo = {
        _selectedYear: this.selectedYear,
        _selectedMake: this.selectedMake,
        _selectedModel : this.selectedModel
      };
      console.log("diff : " ); 
      console.log('getVehicleDetailsInfo : '+JSON.parse(JSON.stringify(vehicleDetailsInfo)));
      return vehicleDetailsInfo;
    }

    setVehicleInfoRecord(Obj) {
      console.log('   setVehicleInfoRecord vehicleInfoRec _selectedYear '+ Obj._selectedYear);
      this.selectedYear = Obj._selectedYear !== undefined  ? Obj._selectedYear : '';
      console.log('   setVehicleInfoRecord vehicleInfoRec this.selectedYear '+ this.selectedYear);
      console.log('   setVehicleInfoRecord vehicleInfoRec _selectedMake '+ Obj._selectedMake);
      this.selectedMake = Obj._selectedMake!== undefined ? Obj._selectedMake : '';
      console.log('   setVehicleInfoRecord vehicleInfoRec this.selectedMake  '+this.selectedMake );
      console.log('   setVehicleInfoRecord vehicleInfoRec _selectedModel '+ Obj._selectedModel);
      this.selectedModel = Obj._selectedModel !== undefined ? Obj._selectedModel : '';
      console.log('   setVehicleInfoRecord vehicleInfoRec this.selectedModel '+ this.selectedModel);
    }

    connectedCallback() {
      this.getAllAvailableYearsHelper();
      this.getAllAvailableVehicleMakeHelper();
    }

    getAllAvailableYearsHelper() {
      getAllYears().then(result => {
        console.log(JSON.parse(JSON.stringify(result)));
        const _availableYearOptions = [];
        if(data.items !== undefined){
            data.items.forEach(element => {
                let selectOption = {
                  label : element,
                  value : element
                }; 
                _availableYearOptions.push(selectOption);
                  
            });
            //console.log('_availableYearOptions : ');
            //console.log(JSON.parse(JSON.stringify(_availableYearOptions)));  
        }
        this.availableYearOptions = _availableYearOptions;
        this.isLoading = false;
        this.error = undefined;  
      })
      .catch(error => {
        this.error = error;
        this.availableYearOptions = undefined;
        this.isLoading = false;
      });
    }

    getAllAvailableVehicleMakeHelper() {
      getAllVehicleMakeInfo().then(result => {
        console.log(JSON.parse(JSON.stringify(result)));
        const _availableVehicleMakeOptions = [];
          if(data.items !== undefined){
              data.items.forEach(element => {
                  let selectOption = {
                    label : element,
                    value : element
                  }; 
                  _availableVehicleMakeOptions.push(selectOption);
                    
              });
              //console.log(JSON.parse(JSON.stringify(_availableVehicleMakeOptions)));  
          }
          this.availableMakeOptions = _availableVehicleMakeOptions;
          this.isLoading = false;
          this.error = undefined;
      })
      .catch(error => {
        this.error = error;
          this.availableMakeOptions = [];
          this.isLoading = false;
      });
    }

    /*
    @wire(getAllYears)
    getAllAvailableYears({ error, data }) {
      if (data) {
        //console.log('onload getAllAvailableYears !!! ');
          //console.log(JSON.parse(JSON.stringify(data))); 
          
          const _availableYearOptions = [];
          if(data.items !== undefined){
              data.items.forEach(element => {
                  let selectOption = {
                    label : element,
                    value : element
                  }; 
                  _availableYearOptions.push(selectOption);
                    
              });
              //console.log('_availableYearOptions : ');
              //console.log(JSON.parse(JSON.stringify(_availableYearOptions)));  
          }
          this.availableYearOptions = _availableYearOptions;
          this.isLoading = false;
          this.error = undefined;
          //console.log('_availableYearOptions : ');
            //console.log(JSON.parse(JSON.stringify(_availableYearOptions))); 
      } else if (error) {
          this.error = error;
          this.availableYearOptions = undefined;
          this.isLoading = false;
      }
    }

    @wire(getAllVehicleMakeInfo)
    getAllAvailableVehicleMakeInfo({ error, data }) {
      if (data) {
        //console.log('onload getAllAvailableVehicleMakeInfo !!! ');
        //console.log(JSON.parse(JSON.stringify(data))); 
          
          const _availableVehicleMakeOptions = [];
          if(data.items !== undefined){
              data.items.forEach(element => {
                  let selectOption = {
                    label : element,
                    value : element
                  }; 
                  _availableVehicleMakeOptions.push(selectOption);
                    
              });
              //console.log(JSON.parse(JSON.stringify(_availableVehicleMakeOptions)));  
          }
          this.availableMakeOptions = _availableVehicleMakeOptions;
          this.isLoading = false;
          this.error = undefined;
      } else if (error) {
          this.error = error;
          this.availableMakeOptions = [];
          this.isLoading = false;
      }
    }*/

  
    /*
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
    */
    handleYearChange(event) {
        console.log('--year changed--'+event.target.value);
        this.selectedYear = event.target.value;//event.detail.value;
        //console.log('this.selectedYear : '+this.selectedYear);
        //this.getAllYearsOnSearch();
    }

    handleMakeChange(event) {
        console.log('--Make changed--'+event.target.value);
        this.selectedMake = event.target.value;//event.detail.value;
        //console.log('this.selectedMake : '+this.selectedMake);
        //this.getAllVehicleMakeInfoOnSearch();
        this.selectedModel = '';
        if(this.selectedMake !== undefined && this.selectedMake !== '' ){
          this.getAllVehicleModelByMakeInfoOnSearch();
        }
        
        
        
    }

    handleModelChange(event) {
      console.log('--Model changed--'+event.target.value);
      this.selectedModel = event.target.value;//event.detail.value;
    }

    
    /*
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

          
            getAllVehicleMakeInfo({ vehicleMakeStr : this.selectedMake })
              .then(result => {
                console.log(JSON.parse(JSON.stringify(result)));
                
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
          //this.availableServices = this.availableServicesObj;
          this.isLoading = false;
        }
    }*/
    /*handleModelkeyup(event) {
      console.log('this.selectedMake : '+this.selectedMake);
      this.selectedModel = event.target.value;
      console.log('this.selectedModel : '+this.selectedModel);
      this.getAllVehicleModelByMakeInfoOnSearch();
    }
    handleModelChange(event) {
      console.log('this.selectedModel'+this.selectedModel);
      console.log('event.detail.value'+event.detail.value);
      this.selectedModel = event.detail.value;
      console.log('this.selectedModel'+this.selectedModel);
      this.getAllVehicleModelByMakeInfoOnSearch();
    }*/

    getAllVehicleModelByMakeInfoOnSearch() {
        console.log('getAllVehicleModelByMakeInfoOnSearch');
        //console.log(JSON.parse(JSON.stringify(this.selectedModel)))
        //console.log(JSON.parse(JSON.stringify(this.selectedMake)));
        //let t0 = new Date().getTime();//performance.now();
        //let t1; 
        //let diffTime;
        //console.log("Started on : " + t0);
        //console.log("this.selectedMake : " + this.selectedMake);
        //console.log(" this.selectedModel : " + this.selectedModel);
        //if (this.selectedModel !== undefined && this.selectedModel !== '' && this.selectedModel.length > 2)   {
          if (this.selectedMake !== undefined && this.selectedMake !== '')   {
                //this.isLoading = true;
            getAllVehicleModelsByMakeSelectedInfo({ makeSelectedStr: this.selectedMake , modelStr : '' })
                .then(result => {
                  //console.log(JSON.parse(JSON.stringify(result)));
                  const _availableModelOptions = [];
                  if(result.items !== undefined){
                    result.items.forEach(element => {
                          let selectOption = {
                            label : element,
                            value : element
                          }; 
                          _availableModelOptions.push(selectOption);
                            
                      });
                      //console.log(JSON.parse(JSON.stringify(_availableVehicleMakeOptions)));  
                  }
                  this.availableModelOptions = _availableModelOptions;
                  //this.isLoading = false;
                  this.error = undefined;
                })
                .catch(error => {
                this.error = error;
                this.availableServices = undefined;
                //this.isLoading = false;
            });
            
        } else {
            //this.availableServices = this.availableServicesObj;
            //this.isLoading = false;
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