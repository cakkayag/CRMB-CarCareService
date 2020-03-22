import { LightningElement, api, track } from "lwc";

//import css from static resource
import carCareResources from "@salesforce/resourceUrl/CarCareReserveService";
import { loadStyle } from "lightning/platformResourceLoader";

export default class lwc_CarCareServiceContactInfoComp extends LightningElement {
  @api source;
  @api contactRec = {};

  @track firstNameVar;
  @track lastNameVar;
  @track emailVar;
  @track mobileVar;
  @track acceptedPromotions;
  @track isValidated = false;

  hasRendered = false;

  renderedCallback() {
    if (!this.hasRendered) {
      this.contactRec = JSON.parse(JSON.stringify(this.contactRec));
      if (this.contactRec !== undefined && this.contactRec !== {}) {
        this.setContactRecord(this.contactRec);
        if (this.isValidated === true) {
          this.enableContinue(event);
        }
      }

      Promise.all([
        loadStyle(this, carCareResources + "/css/reserveService.css")
      ])
        .then(() => {})
        .catch(error => {
          // eslint-disable-next-line no-console
          console.log("--error--" + error);
        });

      this.hasRendered = true;
    }
  }

  handleOnChange(event) {
    if (event.target.name === "mobileVar") {
      this[event.target.name] = this.formatPhoneNumber(event.target.value);
    } else {
      this[event.target.name] = event.target.value;
    }
    this.checkEnableContinueButton(event);
  }

  formatPhoneNumber(phoneNumberString) {
    var cleaned = ("" + phoneNumberString).replace(/\D/g, "");
    console.log("--cleaned--" + cleaned);
    var match = cleaned.match(/^(\d|)?(\d{3})(\d{3})(\d{4})$/);
    console.log("--match--" + match);
    if (match) {
      var intlCode = match[1] ? "+" + match[1] + " " : "";
      return [intlCode, "(", match[2], ") ", match[3], "-", match[4]].join("");
    }
    return cleaned;
  }

  checkEnableContinueButton(event) {
    if (
      this.firstNameVar &&
      this.lastNameVar &&
      this.emailVar &&
      this.mobileVar
    ) {
      this.isValidated = true;
      this.enableContinue(event);
    } else if (this.isValidated === true) {
      this.isValidated = false;
      this.enableContinue(event);
    }
  }

  enableContinue(event) {
    // Creates the event to disable continue event.
    const selectedEvent = new CustomEvent("enablecontinue", {
      detail: this.isValidated
    });
    // Dispatches the event.
    this.dispatchEvent(selectedEvent);
  }

  handleSelection(event) {
    this[event.target.name] = event.target.checked;
  }

  @api
  getContactInfo() {
    const inputComponents = this.template.querySelectorAll("lightning-input");
    inputComponents.forEach(element => {
      if (element.type === "checkbox") {
        this[element.name] = element.checked;
      } else {
        this[element.name] = element.value;
      }
    });

    let contact = {
      firstName: this.firstNameVar,
      lastName: this.lastNameVar,
      email: this.emailVar,
      mobile: this.mobileVar,
      _acceptedPromotions: this.acceptedPromotions,
      _isValidated: this.isValidated
    };
    return contact;
  }

  setContactRecord(Obj) {
    this.firstNameVar = Obj.firstName !== undefined ? Obj.firstName : "";
    this.lastNameVar = Obj.lastName !== undefined ? Obj.lastName : "";
    this.emailVar = Obj.email !== undefined ? Obj.email : "";
    this.mobileVar = Obj.mobile !== undefined ? Obj.mobile : "";
    this.isValidated =
      Obj._isValidated !== undefined ? Obj._isValidated : false;
    this.acceptedPromotions =
      Obj._acceptedPromotions !== undefined ? Obj._acceptedPromotions : false;
  }

  @api
  ValidateContactInfo(evt) {
    const allValid = [
      ...this.template.querySelectorAll("lightning-input")
    ].reduce((validSoFar, inputCmp) => {
      inputCmp.reportValidity();
      return validSoFar && inputCmp.checkValidity();
    }, true);
    if (allValid) {
      //continue;
    } else {
      //stop;
      //Some scenarios i need to run this method
      //by passing null as event so filterig out those.
      if (evt != null) {
        evt.preventDefault();
        evt.stopPropagation();
      }
    }
    return allValid;
  }
}