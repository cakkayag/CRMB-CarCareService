import { LightningElement, track, wire, api } from "lwc";
import getAllVehicleMakeInfo from "@salesforce/apex/AppointmentIntegrationServices.getAllVehicleMakes";
import getAllVehicleModelsByMakeSelectedInfo from "@salesforce/apex/AppointmentIntegrationServices.getAllVehicleModelsByMakeSelected";
import getAllYears from "@salesforce/apex/AppointmentIntegrationServices.getYears";

export default class lwc_CarCareServiceVehicleInfoComp extends LightningElement {
  @api vehicleInfoRec = {};

  @track selectedYear = "";
  @track selectedMake = "";
  @track selectedModel = "";
  @track selectedMileage = "";
  @track availableModelOptions = [];
  @track availableMakeOptions = [];
  @track availableYearOptions = [];
  @track isLoading = true;
  @track isModelLoading = false;
  @track error;
  @track isVehicleInfoValidated = false;

  hasRendered = false;

  renderedCallback() {
    if (!this.hasRendered) {
      if (this.template.querySelector(".yearsValueList") != null) {
        let yearsListId = this.template.querySelector(".yearsValueList").id;
        this.template
          .querySelector(".yearsInput")
          .setAttribute("list", yearsListId);

        let makeListId = this.template.querySelector(".makeValueList").id;
        this.template
          .querySelector(".makeInput")
          .setAttribute("list", makeListId);

        let modelListId = this.template.querySelector(".modelValueList").id;
        this.template
          .querySelector(".modelInput")
          .setAttribute("list", modelListId);
        if (this.vehicleInfoRec !== undefined && this.vehicleInfoRec !== {}) {
          this.vehicleInfoRec = JSON.parse(JSON.stringify(this.vehicleInfoRec));
          this.setVehicleInfoRecord(this.vehicleInfoRec);

          if (this.isVehicleInfoValidated === true) {
            this.enableContinue(event);
          }
        }
        this.hasRendered = true;
      }
    }
  }

  get isLoaded() {
    return this.isLoading ? false : true;
  }

  get isModelLoaded() {
    return this.isModelLoading ? false : true;
  }

  @api
  getVehicleDetailsInfo() {
    let vehicleDetailsInfo = {
      _selectedYear: this.selectedYear,
      _selectedMake: this.selectedMake,
      _selectedModel: this.selectedModel,
      _selectedMileage: this.selectedMileage,
      _isVehicleInfoValidated: this.isVehicleInfoValidated
    };
    return vehicleDetailsInfo;
  }

  setVehicleInfoRecord(Obj) {
    this.selectedYear =
      Obj._selectedYear !== undefined ? Obj._selectedYear : "";
    this.selectedMake =
      Obj._selectedMake !== undefined ? Obj._selectedMake : "";
    this.selectedModel =
      Obj._selectedModel !== undefined ? Obj._selectedModel : "";
    this.selectedMileage =
      Obj._selectedMileage !== undefined ? Obj._selectedMileage : "";

    this.isVehicleInfoValidated =
      Obj._isVehicleInfoValidated !== undefined
        ? Obj._isVehicleInfoValidated
        : false;
  }

  @wire(getAllYears)
  getAllAvailableYears({ error, data }) {
    if (data) {
      const _availableYearOptions = [];
      if (data.items !== undefined) {
        data.items.forEach(element => {
          let selectOption = {
            label: element,
            value: element
          };
          _availableYearOptions.push(selectOption);
        });
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

  @wire(getAllVehicleMakeInfo)
  getAllAvailableVehicleMakeInfo({ error, data }) {
    if (data) {
      const _availableVehicleMakeOptions = [];
      if (data.items !== undefined) {
        data.items.forEach(element => {
          let selectOption = {
            label: element,
            value: element
          };
          _availableVehicleMakeOptions.push(selectOption);
        });
      }
      this.availableMakeOptions = _availableVehicleMakeOptions;
      this.isLoading = false;
      this.error = undefined;
    } else if (error) {
      this.error = error;
      this.availableMakeOptions = [];
      this.isLoading = false;
    }
  }

  handleYearChange(event) {
    this.selectedYear = event.target.value;
    this.checkEnableContinueButton(event);
  }

  handleMakeChange(event) {
    this.isModelLoading = true;
    this.selectedMake = event.target.value;
    this.selectedModel = "";
    if (this.selectedMake !== undefined && this.selectedMake !== "") {
      this.getAllVehicleModelByMakeInfoOnSearch();
    }
    this.checkEnableContinueButton(event);
  }

  handleModelChange(event) {
    this.selectedModel = event.target.value;
    this.checkEnableContinueButton(event);
  }
  handleMileageChange(event) {
    this.selectedMileage = event.target.value;
  }

  checkEnableContinueButton(event) {
    if (this.selectedYear && this.selectedMake && this.selectedModel) {
      this.isVehicleInfoValidated = true;
      this.enableContinue(event);
    } else if (this.isVehicleInfoValidated === true) {
      this.isVehicleInfoValidated = false;
      this.enableContinue(event);
    }
  }

  enableContinue(event) {
    // Creates the event to disable continue event.
    const selectedEvent = new CustomEvent("enablecontinue", {
      detail: this.isVehicleInfoValidated
    });
    // Dispatches the event.
    this.dispatchEvent(selectedEvent);
  }

  getAllVehicleModelByMakeInfoOnSearch() {
    if (this.selectedMake !== undefined && this.selectedMake !== "") {
      getAllVehicleModelsByMakeSelectedInfo({
        makeSelectedStr: this.selectedMake,
        modelStr: ""
      })
        .then(result => {
          const _availableModelOptions = [];
          if (result.items !== undefined) {
            result.items.forEach(element => {
              let selectOption = {
                label: element,
                value: element
              };
              _availableModelOptions.push(selectOption);
            });
          }
          this.availableModelOptions = _availableModelOptions;
          this.isModelLoading = false;
          this.error = undefined;
        })
        .catch(error => {
          this.error = error;
          this.availableServices = undefined;
          this.isModelLoading = false;
        });
    } else {
    }
  }
}