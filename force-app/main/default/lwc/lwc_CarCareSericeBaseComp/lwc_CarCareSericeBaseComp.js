import { LightningElement, wire, track } from "lwc";
import { CurrentPageReference } from "lightning/navigation";
import { fireEvent } from "c/pubsub";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import reserveAppointment from "@salesforce/apex/AppointmentIntegrationServices.reserveAppointment";

export default class lwc_CarCareSericeBaseComp extends LightningElement {
  @wire(CurrentPageReference) pageRef;
  @track nextPage = 2;
  @track previousPage = 1;
  @track CurrentPage = 1;
  maxPages = 6;
  minPages = 1;
  @track contactInfo = {};
  @track serviceSelectInfo = {};
  @track uniqueUrlKey = "store";
  @track branchIdVal = "";
  @track vehicleInfo = {};
  @track storeId = "";
  @track availableStoreList = [];
  @track selectedStoreObjInfo = {};
  @track dateTimeInfo = {};
  @track appointmentSelectionInfo = {};
  @track showSelectNewDateTimePopup = false;
  @track disableContinue = true;

  appointmentId = "";

  connectedCallback() {
    this.branchIdVal = this.getUrlParamValue(
      window.location.href,
      this.uniqueUrlKey
    );
    if (
      this.branchIdVal === undefined ||
      this.branchIdVal === "" ||
      this.branchIdVal === null
    ) {
      this.showToast(
        "Error",
        "Missing valid " +
          this.uniqueUrlKey +
          " key in url, Please contact Support team",
        "Error",
        "sticky"
      );
    }
  }

  disconnectedCallback() {
    // unsubscribe from searchKeyChange event
  }

  handleStoreChange(event) {
    this.branchIdVal = event.detail._branchId;
    this.storeId = event.detail._storeRecordId;
    const storeInfoComp = this.template.querySelector(
      "c-lwc_-car-care-service-store-locator-comp"
    );
    const _availableStoreList = storeInfoComp.getSelectedStoreObjInfo(true);
    this.availableStoreList = JSON.parse(JSON.stringify(_availableStoreList));
    this.serviceSelectInfo = {};
    this.appointmentSelectionInfo = {};
  }

  handleEnableContinue(event) {
    var continueBtn = this.template.querySelector(".continueBtn");
    if (event.detail) {
      continueBtn.classList.add("enableContinueBtn");
      continueBtn.disabled = false;
    } else {
      continueBtn.classList.remove("enableContinueBtn");
      continueBtn.disabled = true;
    }
  }

  handleContinue(event) {
    //remove enable unless all validations complete
    var continueBtn = this.template.querySelector(".continueBtn");
    continueBtn.classList.remove("enableContinueBtn");
    continueBtn.disabled = true;

    const contactComp = this.template.querySelector(
      "c-lwc_-car-care-service-contact-info-comp"
    );
    const sericeSelectComp = this.template.querySelector(
      "c-lwc_-car-care-service-select-comp"
    );
    const vehicleInfoComp = this.template.querySelector(
      "c-lwc_-car-care-service-vehicle-info-comp"
    );
    const storeInfoComp = this.template.querySelector(
      "c-lwc_-car-care-service-store-locator-comp"
    );
    const appointmentSelectComp = this.template.querySelector(
      "c-lwc_-car-care-service-Appointment-comp"
    );

    let validationStatus = true;
    if (this.CurrentPage === 2) {
      validationStatus = contactComp.ValidateContactInfo(event);
    } else if (this.CurrentPage === 4) {
    }

    if (validationStatus) {
      if (this.CurrentPage === 1) {
        const _availableStoreList = storeInfoComp.getSelectedStoreObjInfo(
          false
        );
        this.availableStoreList = JSON.parse(
          JSON.stringify(_availableStoreList)
        );
        this.storeId = storeInfoComp.getSelectedStoreId();
        this.selectedStoreObjInfo = storeInfoComp.getSelectedStoreObj();
      } else if (this.CurrentPage === 2) {
        const contactTemp = contactComp.getContactInfo();
        this.contactInfo = JSON.parse(JSON.stringify(contactTemp));
      } else if (this.CurrentPage === 3) {
        const vehicleTemp = vehicleInfoComp.getVehicleDetailsInfo();
        this.vehicleInfo = JSON.parse(JSON.stringify(vehicleTemp));
      } else if (this.CurrentPage === 4) {
        const serviceSelectInfoTemp = sericeSelectComp.getServiceInfo();
        this.serviceSelectInfo = JSON.parse(
          JSON.stringify(serviceSelectInfoTemp)
        );
      } else if (this.CurrentPage === 5) {
        const appointmentSelectionInfoTemp = appointmentSelectComp.getAppointmentInfo();
        this.appointmentSelectionInfo = JSON.parse(
          JSON.stringify(appointmentSelectionInfoTemp)
        );
      }

      this.previousPage = this.CurrentPage;
      this.CurrentPage = this.nextPage;
      this.nextPage =
        this.nextPage < this.maxPages ? this.nextPage + 1 : this.nextPage;
      fireEvent(this.pageRef, "buttonClickedEvent", this);
    }
  }

  handlePrevious() {
    var continueBtn = this.template.querySelector(".continueBtn");
    continueBtn.classList.add("enableContinueBtn");

    if (this.CurrentPage === 2) {
      const contactComp = this.template.querySelector(
        "c-lwc_-car-care-service-contact-info-comp"
      );
      const contactTemp = contactComp.getContactInfo();
      this.contactInfo = JSON.parse(JSON.stringify(contactTemp));
    } else if (this.CurrentPage === 3) {
      const vehicleInfoComp = this.template.querySelector(
        "c-lwc_-car-care-service-vehicle-info-comp"
      );
      const vehicleTemp = vehicleInfoComp.getVehicleDetailsInfo();
      this.vehicleInfo = JSON.parse(JSON.stringify(vehicleTemp));
    } else if (this.CurrentPage === 4) {
      const sericeSelectComp = this.template.querySelector(
        "c-lwc_-car-care-service-select-comp"
      );
      const serviceSelectInfoTemp = sericeSelectComp.getServiceInfo();
      this.serviceSelectInfo = JSON.parse(
        JSON.stringify(serviceSelectInfoTemp)
      );
    } else if (this.CurrentPage === 5) {
      const appointmentSelectComp = this.template.querySelector(
        "c-lwc_-car-care-service-Appointment-comp"
      );
      const appointmentSelectionInfoTemp = appointmentSelectComp.getAppointmentInfo();
      this.appointmentSelectionInfo = JSON.parse(
        JSON.stringify(appointmentSelectionInfoTemp)
      );
    }

    this.nextPage = this.CurrentPage;
    this.CurrentPage = this.previousPage;
    this.previousPage =
      this.previousPage > this.minPages
        ? this.previousPage - 1
        : this.previousPage;

    fireEvent(this.pageRef, "buttonClickedEvent", this);
  }

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
    return this.minPages < this.CurrentPage && this.CurrentPage < this.maxPages
      ? false
      : true;
  }

  get showContinue() {
    return this.CurrentPage < this.maxPages ? true : false;
  }

  get showConfirmation() {
    return this.CurrentPage == this.maxPages &&
      (this.appointmentId === undefined || this.appointmentId === "")
      ? true
      : false;
  }

  get showStoreChangeAlert() {
    return this.serviceSelectInfo === undefined ||
      JSON.stringify(this.serviceSelectInfo) === JSON.stringify({}) ||
      this.serviceSelectInfo._isUpdated === false
      ? false
      : true;
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

  getUrlParamValue(url, key) {
    return new URL(url).searchParams.get(key);
  }

  handleEditRequest(event) {
    this.handleEditRequestHelper(event, event.detail);
  }

  handleEditRequestHelper(event, navigateId) {
    this.CurrentPage = parseInt(navigateId, 0);
    this.previousPage = this.CurrentPage;
    this.nextPage = this.CurrentPage;
    this.previousPage =
      this.previousPage > this.minPages
        ? this.previousPage - 1
        : this.previousPage;
    this.nextPage =
      this.nextPage < this.maxPages ? this.nextPage + 1 : this.nextPage;
    this.handleEnableContinue(event);
    fireEvent(this.pageRef, "buttonClickedEvent", this);
  }

  navigateToAppointmentPage(event) {
    this.appointmentSelectionInfo = {};
    this.showSelectNewDateTimePopup = false;
    this.handleEditRequestHelper(event, 5);
  }

  sendAppointmentReservationReq(event) {
    const _appointmentTime =
      this.appointmentSelectionInfo._selectedActualDate !== undefined &&
      this.appointmentSelectionInfo._selectedHour !== undefined
        ? this.prepareTimeStampFromStr(
            this.appointmentSelectionInfo._selectedActualDate,
            this.appointmentSelectionInfo._selectedHour
          )
        : "";

    let _serviceSelected = "";
    if (
      this.serviceSelectInfo !== undefined &&
      this.serviceSelectInfo._availableServices !== undefined
    ) {
      this.serviceSelectInfo._availableServices.forEach(element => {
        if (element.isSelected === true) {
          _serviceSelected = _serviceSelected + "" + element.name;
        }
      });
    }

    let reservationObj = {
      storeId: this.storeId,
      customerFirstName:
        this.contactInfo !== undefined &&
        this.contactInfo.firstName !== undefined
          ? this.contactInfo.firstName
          : "",
      customerLastName:
        this.contactInfo !== undefined &&
        this.contactInfo.lastName !== undefined
          ? this.contactInfo.lastName
          : "",
      customerEmail:
        this.contactInfo !== undefined && this.contactInfo.email !== undefined
          ? this.contactInfo.email
          : "",
      customerPhone:
        this.contactInfo !== undefined && this.contactInfo.mobile !== undefined
          ? this.contactInfo.mobile
          : "",
      vehicleMake:
        this.vehicleInfo !== undefined &&
        this.vehicleInfo._selectedMake !== undefined
          ? this.vehicleInfo._selectedMake
          : "",
      vehicleModel:
        this.vehicleInfo !== undefined &&
        this.vehicleInfo._selectedModel !== undefined
          ? this.vehicleInfo._selectedModel
          : "",
      vehicleYear:
        this.vehicleInfo !== undefined &&
        this.vehicleInfo._selectedYear !== undefined
          ? this.vehicleInfo._selectedYear
          : "",
      vehicleMileage:
        this.vehicleInfo !== undefined &&
        this.vehicleInfo._selectedMileage !== undefined
          ? this.vehicleInfo._selectedMileage
          : "",

      appointmentTime: _appointmentTime,

      storeResource:
        this.selectedStoreObjInfo != undefined &&
        this.selectedStoreObjInfo.phone !== undefined
          ? this.selectedStoreObjInfo.phone
          : "",
      storeResourceDescription:
        this.selectedStoreObjInfo != undefined &&
        this.selectedStoreObjInfo.phone !== undefined
          ? this.selectedStoreObjInfo.phone
          : "",
      stayingWithVehicle:
        this.appointmentSelectionInfo != undefined &&
        this.appointmentSelectionInfo._stayWithVehicle !== undefined
          ? this.appointmentSelectionInfo._stayWithVehicle
          : "",
      customerWantsPromos:
        this.appointmentSelectionInfo != undefined &&
        this.appointmentSelectionInfo._stayWithVehicle !== undefined
          ? this.appointmentSelectionInfo._stayWithVehicle
          : "",
      customerWantsSmsReminders:
        this.appointmentSelectionInfo != undefined &&
        this.appointmentSelectionInfo._stayWithVehicle !== undefined
          ? this.appointmentSelectionInfo._stayWithVehicle
          : "",
      customerNeedsTransportation:
        this.appointmentSelectionInfo != undefined &&
        this.appointmentSelectionInfo._needTransportationServices !== undefined
          ? this.appointmentSelectionInfo._needTransportationServices
          : "",
      serviceDescription: _serviceSelected
    };

    let _reservationObj = JSON.stringify(reservationObj);
    reserveAppointment({ payLoad: _reservationObj })
      .then(result => {
        if (result !== undefined && result.hasException !== true) {
          this.showToast(
            "SUCCESS",
            "Your Appointment has been confirmed",
            "Success",
            "sticky"
          );

          this.appointmentId = result.id;

          this.isLoading = false;
          this.error = undefined;

          this.showSelectNewDateTimePopup = false;

          this.navigateToThankYouPage(event);
        } else {
          this.error =
            result !== undefined && result.exceptionMessage !== undefined
              ? result.exceptionMessage
              : "No Records found";
          this.isLoading = false;
          this.showToast(
            "Error",
            "Error Occured while fetching Store Info ( " +
              this.error +
              " ), Please contact Support team",
            "Error",
            "sticky"
          );
          this.showSelectNewDateTimePopup = true;
        }
      })
      .catch(error => {
        this.error = error;
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

  prepareTimeStampFromStr(actualDate, selectedHr) {
    var d = actualDate.substring(0, actualDate.indexOf(" "));
    var dsplit = d.split("/");

    var hoursToadd = 0;
    let isNoon = selectedHr.substr(0, selectedHr.indexOf(":")) != 12;
    if (
      selectedHr.substr(selectedHr.indexOf(" ") + 1, 4) === "P.M." &&
      isNoon
    ) {
      hoursToadd = 12;
    }
    var hrFormat = +selectedHr.substr(0, selectedHr.indexOf(":")) + +hoursToadd;
    if (hrFormat < 10) {
      hrFormat = "0" + hrFormat;
    }
    var monFormat = dsplit[0];
    if (monFormat.length == 1) monFormat = "0" + monFormat;
    let stime =
      dsplit[2] +
      "-" +
      monFormat +
      "-" +
      dsplit[1] +
      "T" +
      hrFormat +
      ":" +
      selectedHr.substr(selectedHr.indexOf(":") + 1, 2) +
      ":00.000Z";
    return stime;
  }

  startNewSearch(event) {
    //Navigate to locator page
    window.location.replace("https://locator.carolinas.aaa.com/search");
  }

  navigateToThankYouPage(event) {
    window.location.replace("https://carolinas.aaa.com/carcare-thankyou/");
  }
}