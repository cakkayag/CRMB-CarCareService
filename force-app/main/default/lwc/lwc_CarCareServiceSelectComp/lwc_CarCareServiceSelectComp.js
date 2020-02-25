import { LightningElement, track, api } from "lwc";
import getAvailableServices from "@salesforce/apex/AppointmentIntegrationServices.getAllAvailableServices";

export default class lwc_CarCareServiceSelectComp extends LightningElement {
  @api serviceSelect = {};
  @api storeId;

  @track availableServices = [];
  @track error;
  @track isLoading = true;
  @track serviceAdditionalInfo = "";
  @track hasError = false;
  isUpdated = false;

  connectedCallback() {
    this.getAvailableServicesByStore();
  }

  getAvailableServicesByStore() {
    this.serviceSelect = JSON.parse(JSON.stringify(this.serviceSelect));
    if (
      this.serviceSelect === undefined ||
      JSON.stringify(this.serviceSelect) === JSON.stringify({})
    ) {
      this.availableServices = [];
      this.serviceAdditionalInfo = "";
      this.isUpdated = false;
      if (
        this.availableServices === undefined ||
        this.availableServices.length <= 0
      ) {
        getAvailableServices({ storeId: this.storeId })
          .then(result => {
            const availableServicesTemp = [];
            if (result.items !== undefined) {
              result.items.forEach(element => {
                if (
                  element.isPackage === undefined ||
                  element.isPackage !== true
                ) {
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
            this.enableContinue(event);
          })
          .catch(error => {
            this.error = error;
            this.availableServices = undefined;
            this.isLoading = false;
          });
      } else {
        this.isLoading = false;
      }
    } else if (this.serviceSelect !== undefined) {
      this.availableServices = this.serviceSelect._availableServices;
      this.serviceAdditionalInfo = this.serviceSelect._serviceAdditionalInfo;
      this.isUpdated = this.serviceSelect._isUpdated;
      this.isLoading = false;
    } else {
      this.isLoading = false;
    }
  }

  get isLoaded() {
    return this.isLoading ? false : true;
  }

  handleSelection(event) {
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
    }
    this.availableServices = availableServicesTemp;
    this.isUpdated = true;
  }

  onTextAreaChange(event) {
    this.serviceAdditionalInfo = event.target.value;
    this.isUpdated = true;
  }

  enableContinue(event) {
    // Creates the event to disable continue event.
    const selectedEvent = new CustomEvent("enablecontinue", {});
    // Dispatches the event.
    this.dispatchEvent(selectedEvent);
  }

  @api
  getServiceInfo() {
    let serviceSelectInfo = {
      _availableServices: this.availableServices,
      _serviceAdditionalInfo: this.serviceAdditionalInfo,
      _isUpdated: this.isUpdated
    };
    return serviceSelectInfo;
  }
}