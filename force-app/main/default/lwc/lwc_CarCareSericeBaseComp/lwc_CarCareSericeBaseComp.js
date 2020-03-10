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

  appointmentId = "";
  //@track hasUpdates = false;
  //@track isChildLoading = false;

  connectedCallback() {
    /*Handling Changes related to pages when clicked specific tile of Navigation  
        registerListener('navigationClickedEvent', this.handleNavigationEvent, this);*/
    //registerListener('storeChangeRequested', this.handleStoreChange, this);
    //console.log(" this.storeIdUrlKey  : "+this.storeIdUrlKey);
    //console.log(" this.storeIdVal : "+this.storeIdVal);
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
    //unregisterAllListeners(this);
  }

  handleStoreChange(event) {
    //console.log('###### handleStoreChange ########');
    //console.log(JSON.parse(JSON.stringify(event)));
    //console.log('handleStoreChange'+event.detail._branchId+'   detail._storeRecordId  '+event.detail._storeRecordId);
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
    console.log("###### handleEnableContinue ########");
    console.log(JSON.parse(JSON.stringify(event)));
    var continueBtn = this.template.querySelector(".continueBtn");
    if (event.detail) {
      continueBtn.classList.add("enableContinueBtn");
    } else {
      continueBtn.classList.remove("enableContinueBtn");
    }

    //continueBtn.disabled = false;
  }

  handleContinue(event) {
    //remove enable unless all validations complete
    var continueBtn = this.template.querySelector(".continueBtn");
    continueBtn.classList.remove("enableContinueBtn");
    //continueBtn.disabled = true;

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
      //validationStatus = sericeSelectComp.ValidateServiceSelection(event) ;
    }
    //console.log(" validationStatus : "+validationStatus);
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

        //console.log("handleContinue this.CurrentPage === 1 ");
        //console.log(JSON.parse(JSON.stringify(this.availableStoreList)));
        //console.log(JSON.parse(JSON.stringify(this.selectedStoreObjInfo)));
      } else if (this.CurrentPage === 2) {
        //remove this later
        continueBtn.disabled = false;
        const contactTemp = contactComp.getContactInfo();
        this.contactInfo = JSON.parse(JSON.stringify(contactTemp));
        //console.log(JSON.parse(JSON.stringify(this.contactInfo)));

        /*let state = { page_id: "ContactInfo", user_id: "select store" };
        let title = "Contact Info";
        let url = "contact.html";
        history.pushState(state, title, url);*/
      } else if (this.CurrentPage === 3) {
        const vehicleTemp = vehicleInfoComp.getVehicleDetailsInfo();
        this.vehicleInfo = JSON.parse(JSON.stringify(vehicleTemp));
        //console.log(' this.vehicleInfo : '+JSON.parse(JSON.stringify(this.vehicleInfo)));
      } else if (this.CurrentPage === 4) {
        //console.log("   ############# 4 Continue ################## ");
        const serviceSelectInfoTemp = sericeSelectComp.getServiceInfo();
        this.serviceSelectInfo = JSON.parse(
          JSON.stringify(serviceSelectInfoTemp)
        );
        //console.log(JSON.parse(JSON.stringify(this.serviceSelectInfo)));
      } else if (this.CurrentPage === 5) {
        //console.log("   ############# 5 Continue ################## ");
        const appointmentSelectionInfoTemp = appointmentSelectComp.getAppointmentInfo();
        this.appointmentSelectionInfo = JSON.parse(
          JSON.stringify(appointmentSelectionInfoTemp)
        );
        console.log(JSON.parse(JSON.stringify(this.appointmentSelectionInfo)));
      }

      this.previousPage = this.CurrentPage;
      this.CurrentPage = this.nextPage;
      this.nextPage =
        this.nextPage < this.maxPages ? this.nextPage + 1 : this.nextPage;

      /*if(this.CurrentPage === 4){
                this.isChildLoading = true;
            }*/
      fireEvent(this.pageRef, "buttonClickedEvent", this);
    }
  }

  handlePrevious() {
    var continueBtn = this.template.querySelector(".continueBtn");
    continueBtn.classList.add("enableContinueBtn");
    //continueBtn.disabled = false;

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
      //console.log(JSON.parse(JSON.stringify(vehicleTemp)));
      this.vehicleInfo = JSON.parse(JSON.stringify(vehicleTemp));
      //console.log(' this.vehicleInfo : ');
      //console.log(JSON.parse(JSON.stringify(this.vehicleInfo)));
    } else if (this.CurrentPage === 4) {
      //console.log("   ############# 4 Preious ################## ");
      const sericeSelectComp = this.template.querySelector(
        "c-lwc_-car-care-service-select-comp"
      );
      const serviceSelectInfoTemp = sericeSelectComp.getServiceInfo();
      this.serviceSelectInfo = JSON.parse(
        JSON.stringify(serviceSelectInfoTemp)
      );
      //console.log(JSON.parse(JSON.stringify(this.serviceSelectInfo)));
    } else if (this.CurrentPage === 5) {
      console.log("   ############# 5 Previous ################## ");
      const appointmentSelectComp = this.template.querySelector(
        "c-lwc_-car-care-service-Appointment-comp"
      );
      const appointmentSelectionInfoTemp = appointmentSelectComp.getAppointmentInfo();
      this.appointmentSelectionInfo = JSON.parse(
        JSON.stringify(appointmentSelectionInfoTemp)
      );
      console.log(JSON.parse(JSON.stringify(this.appointmentSelectionInfo)));
    }

    this.nextPage = this.CurrentPage;
    this.CurrentPage = this.previousPage;
    this.previousPage =
      this.previousPage > this.minPages
        ? this.previousPage - 1
        : this.previousPage;

    fireEvent(this.pageRef, "buttonClickedEvent", this);
  }

  /*
    handleNavigationEvent(navWrap){
        const contactComp = this.template.querySelector('c-lwc_-car-care-service-contact-info-comp');
        let validationStatus =  true;
        if(navWrap.pSelection === 2 && navWrap.cSelection > 2){
            validationStatus = contactComp.ValidateContactInfo(null) ;
        }
        //console.log(" validationStatus : "+validationStatus);
        if(validationStatus){
            if(navWrap.pSelection === 2){
                const contactComp = this.template.querySelector('c-lwc_-car-care-service-contact-info-comp');
                const contactTemp = contactComp.getContactInfo();
                this.contactInfo = JSON.parse(JSON.stringify(contactTemp))
            }

            this.CurrentPage = navWrap.cSelection;
            this.previousPage = this.CurrentPage > this.minPages ? this.CurrentPage - 1 : this.CurrentPage ;
            this.nextPage = this.CurrentPage < this.maxPages ? this.CurrentPage + 1 : this.CurrentPage ;
        }
        else{
            fireEvent(this.pageRef, 'buttonClickedEvent', this);    
        }

    }
    */
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
    //console.log('##################### showStoreChangeAlert ############# ');
    //console.log(JSON.stringify(this.serviceSelectInfo) === JSON.stringify({}));
    //console.log(JSON.stringify(this.serviceSelectInfo) === JSON.stringify({}));
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
    //console.log('###### handleStoreChange ########');
    //console.log(JSON.parse(JSON.stringify(event)));
    //console.log('handleEditRequest'+event.detail);
    this.CurrentPage = parseInt(navigateId, 0);
    //console.log('this.CurrentPage'+this.CurrentPage);
    this.previousPage = this.CurrentPage;
    this.nextPage = this.CurrentPage;
    this.previousPage =
      this.previousPage > this.minPages
        ? this.previousPage - 1
        : this.previousPage;
    this.nextPage =
      this.nextPage < this.maxPages ? this.nextPage + 1 : this.nextPage;
    //console.log('### handleEditRequest selectedStoreObjInfo: ');
    this.handleEnableContinue(event);
    //console.log(JSON.parse(JSON.stringify(this.selectedStoreObjInfo)));
    fireEvent(this.pageRef, "buttonClickedEvent", this);
  }

  navigateToAppointmentPage(event) {
    this.appointmentSelectionInfo = {};
    this.showSelectNewDateTimePopup = false;
    this.handleEditRequestHelper(event, 5);
  }

  sendAppointmentReservationReq(event) {
    console.log("### sendAppointmentReservationReq: ");
    const _appointmentTime =
      this.appointmentSelectionInfo._selectedActualDate !== undefined &&
      this.appointmentSelectionInfo._selectedHour !== undefined
        ? this.prepareTimeStampFromStr(
            this.appointmentSelectionInfo._selectedActualDate,
            this.appointmentSelectionInfo._selectedHour
          )
        : "";

    console.log("### _appointmentTime: " + _appointmentTime);

    let _serviceSelected = "";
    if (
      this.serviceSelectInfo !== undefined &&
      this.serviceSelectInfo._availableServices !== undefined
    ) {
      this.serviceSelectInfo._availableServices.forEach(element => {
        console.log("### element: " + element);
        if (element.isSelected === true) {
          _serviceSelected = _serviceSelected + "" + element.name;
        }
      });
    }

    console.log("### _serviceSelected: " + _serviceSelected);

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
        this.vehicleInfo.selectedModel !== undefined
          ? this.vehicleInfo.selectedModel
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

    console.log("### reservationObj: " + reservationObj);
    let _reservationObj = JSON.stringify(reservationObj);
    console.log("### reservationObj: ");
    console.log(JSON.parse(JSON.stringify(reservationObj)));
    console.log("### _reservationObj: ");
    console.log(JSON.parse(_reservationObj));
    reserveAppointment({ payLoad: _reservationObj })
      .then(result => {
        console.log("### result: " + result);
        if (result !== undefined && result.hasException !== true) {
          this.showToast(
            "SUCCESS",
            "Your Appointment has been confirmed",
            "Success",
            "sticky"
          );

          this.appointmentId = result.id;

          //var reserveMyAppointmnetBtn = this.template.querySelector(".reserveMyAppointmnetBtn");
          //reserveMyAppointmnetBtn.classList.remove("enableContinueBtn");

          this.isLoading = false;
          this.error = undefined;

          this.showSelectNewDateTimePopup = true;

          //this.navigateToThankYouPage(event);
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
        console.log("### error: ");
        console.log(JSON.parse(JSON.stringify(error)));
        this.error = error;
        //this.selectedStoreInfo = undefined;
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
    console.log("--actualDate--" + actualDate); //"2/27/2020 12:00:00 AM";
    console.log("--selectedHr--" + selectedHr); //"1:30 P.M."

    var d = actualDate.substring(0, actualDate.indexOf(" "));
    console.log(d);

    var dsplit = d.split("/");
    console.log("---date splitted---" + dsplit[1]);

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
    console.log("---retruning in format--" + stime);
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