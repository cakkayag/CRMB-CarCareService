import { LightningElement, track, api } from "lwc";
import getSelectedAndNearbyStoresInfo from "@salesforce/apex/AppointmentIntegrationServices.getSelectedAndNearbyStoresList";
import carCareResources from "@salesforce/resourceUrl/CarCareReserveService";
import { loadStyle } from "lightning/platformResourceLoader";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import storeChangeMessage from "@salesforce/label/c.Store_Change_Message";
import closedStoreWithNoNearByStoreMessage from "@salesforce/label/c.Closed_Store_With_NO_Near_By_Store_Message";
import closedStoreWithNearByStoreMessage from "@salesforce/label/c.Closed_Store_With_Near_By_Store_Message";

export default class lwc_CarCareServiceStoreLocatorComp extends LightningElement {
  infoIconURL = carCareResources + "/images/infoIcon.png";
  @api storeWrapperList = [];
  @api branchId = "";
  @api displayStoreChangeAlert = false;
  newBranchId = "";
  storeRecordId = "";
  @api selectedStoreObj = {};

  @track newStoreSelection = "";
  @track isLoading = true;
  @track error = "";

  @track displayStoreModal = false;
  @track displayStoreClosedModal = false;
  @track showNearbyStore = false;
  hasRendered = false;

  @track showStoreDetail = false;
  @track isSelectedStoreClosed = false;
  @track storeInfoForDisplay = {};

  label = {
    storeChangeMessage,
    closedStoreWithNoNearByStoreMessage,
    closedStoreWithNearByStoreMessage
  };

  renderedCallback() {
    if (!this.hasRendered) {
      Promise.all([
        loadStyle(this, carCareResources + "/css/reserveService.css")
      ])
        .then(() => {})
        .catch(error => {
          // eslint-disable-next-line no-console
          console.log("--error--" + error);
        });
    } else {
      this.hasRendered = true;
    }
  }

  connectedCallback() {
    if (
      this.storeWrapperList === undefined ||
      this.storeWrapperList === [] ||
      this.storeWrapperList.length === 0
    ) {
      this.getStoreInfo();
    } else {
      this.isLoading = false;
      for (let i = 0; i < this.storeWrapperList.length; i++) {
        if (this.storeWrapperList[i].isSelected === false) {
          this.showNearbyStore = true;
          break;
        }
      }
    }
  }

  getDayNameList() {
    return [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday"
    ];
  }

  getStoreInfo() {
    this.isLoading = true;
    getSelectedAndNearbyStoresInfo({ branchId: this.branchId })
      .then(result => {
        const storeInfoTemp = [];
        if (result !== undefined) {
          let now = new Date();
          let dayName = this.getDayNameList()[now.getDay()];
          result.forEach(element => {
            let storeOpeningTimings = "";
            let storeTimingsMap = [];
            if (element.storeHours !== undefined) {
              for (let i = 0; i < element.storeHours.length; i++) {
                if (element.storeHours[i].day !== undefined) {
                  storeTimingsMap.push({
                    key: element.storeHours[i].day,
                    value: element.storeHours[i].hours
                  });
                }
              }
              for (let i = 0; i < element.storeHours.length; i++) {
                if (
                  element.storeHours[i].day !== undefined &&
                  dayName.toUpperCase() ===
                    element.storeHours[i].day.toUpperCase()
                ) {
                  storeOpeningTimings =
                    element.storeHours[i].day +
                    " open " +
                    element.storeHours[i].hours;
                  break;
                }

                //storeOpeningTimings = storeOpeningTimings + element.storeHours[i].day + ' open ' + element.storeHours[i].hours +' \n ';
              }
            }

            let isEqualCheck =
              isNaN(element.branchId) === false &&
              isNaN(this.branchId) === false
                ? Number(element.branchId) === Number(this.branchId)
                : false;
            let selectOption = {
              id: element.id,
              branchId: element.branchId,
              name:
                element.street1 +
                ", " +
                element.city +
                ", " +
                element.state +
                " " +
                element.zip,
              phone: element.phone,
              phoneHref: "tel:" + element.phone,
              url: element.url,
              imageUrl: element.imageUrl,
              status: element.status,
              isSelected: isEqualCheck,
              isNotSelected: isEqualCheck !== true,
              isDisabled: isEqualCheck,
              openingTimings: storeOpeningTimings,
              storeTimingsMap: storeTimingsMap
            };

            if (isEqualCheck) {
              this.storeRecordId = element.id;
              this.selectedStoreObj = selectOption;
              //Re-assigning as this method can be called from multiple places and reassigning default value would be needed
              this.isSelectedStoreClosed = false;
              if (
                element.status === undefined ||
                element.status.toUpperCase() !== "Open".toUpperCase()
              ) {
                this.isSelectedStoreClosed = true;
                this.displayStoreClosedModal = true;
                this.disableContinue(event);
              }
              storeInfoTemp.push(selectOption);
            } else {
              if (
                element.status !== undefined &&
                element.status.toUpperCase() === "Open".toUpperCase()
              ) {
                storeInfoTemp.push(selectOption);
              }
              this.showNearbyStore = true;
            }
          });
        }
        this.storeWrapperList = storeInfoTemp;

        this.isLoading = false;
        this.error = undefined;
      })
      .catch(error => {
        this.error = error;
        this.selectedStoreInfo = undefined;
        this.isLoading = false;
        this.showToast(
          "Error",
          "Error Occured while fetching Store Info ( " +
            this.error +
            " ), Please contact Support team",
          "Error",
          "sticky"
        );
      });
  }

  get isLoaded() {
    return this.isLoading ? false : true;
  }

  @api
  getSelectedStoreObjInfo(reload) {
    if (reload) {
      this.getStoreInfo();
    }
    return this.storeWrapperList;
  }

  @api
  getSelectedStoreId() {
    return this.storeRecordId;
  }

  @api
  getSelectedStoreObj() {
    return this.selectedStoreObj;
  }

  @api
  getIsSelectedStoreClosed() {
    return this.isSelectedStoreClosed;
  }

  onStoreSelection(event) {
    this.newBranchId = event.target.dataset.branchId;
    this.storeRecordId = event.target.dataset.id;

    if (this.displayStoreChangeAlert) {
      this.displayStoreModal = true;
    } else {
      this.handleContinueModal(event);
    }
  }

  disableContinue(event) {
    console.log("---handle disable continue--");
    // Creates the event to disable continue event.
    const selectedEvent = new CustomEvent("disablecontinue", {});
    // Dispatches the event.
    this.dispatchEvent(selectedEvent);
  }

  handleCloseModal() {
    this.displayStoreModal = false;
  }

  handleClosedStoreCloseModal() {
    this.displayStoreClosedModal = false;
    if (this.displayClosedStoreWithOutNearByStore) {
      window.location.href = "http://locator.carolinas.aaa.com/?type=carcare";
    }
  }

  handleContinueModal() {
    this.branchId = this.newBranchId;
    this.handleCloseModal();
    let selectedStore = {
      _branchId: this.branchId,
      _storeRecordId: this.storeRecordId
    };
    // Creates the event with the contact ID data.
    const selectedEvent = new CustomEvent("storechange", {
      detail: selectedStore
    });
    // Dispatches the event.
    this.dispatchEvent(selectedEvent);
  }

  showStoreDetailModal(event) {
    let BranchId = event.target.dataset.branchId;
    for (let i = 0; i < this.storeWrapperList.length; i++) {
      if (BranchId == this.storeWrapperList[i].branchId) {
        this.storeInfoForDisplay = this.storeWrapperList[i];
        break;
      }
    }
    this.showStoreDetail = true;
  }

  closeStoreDetailModal() {
    this.showStoreDetail = false;
    this.storeInfoForDisplay = {};
  }

  get displaySelectedStore() {
    return this.isSelectedStoreClosed ? false : true;
  }

  get displayClosedStoreWithNearByStore() {
    return this.isSelectedStoreClosed && this.showNearbyStore ? true : false;
  }

  get displayClosedStoreWithOutNearByStore() {
    return this.isSelectedStoreClosed && this.showNearbyStore === false
      ? true
      : false;
  }

  showToast(title, message, variant, mode) {
    const evt = new ShowToastEvent({
      title: title,
      message: message,
      variant: variant,
      mode: mode
    });
    this.dispatchEvent(evt);
  }
}