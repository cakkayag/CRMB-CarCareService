import { LightningElement, api, track } from "lwc";

//import css from static resource
import carCareResources from "@salesforce/resourceUrl/CarCareReserveService";
import { loadStyle } from "lightning/platformResourceLoader";

export default class lwc_CarCareServiceContactInfoComp extends LightningElement {
  @api source;
  @api contactRec = {};

  //@api showFirstName = false;
  //@api showLastName = false;
  //@api showEmail = false;
  //@api showMobile = false;

  @track firstNameVar;
  @track lastNameVar;
  @track emailVar;
  @track mobileVar;
  @track acceptedPromotions;
  //@track contactDetails = new this.contact('' , '' , '' , '');

  hasRendered = false;

  /*get sourceURL() {
        return this.baseURL + this.source;
    }*/

  renderedCallback() {
    if (!this.hasRendered) {
      //console.log('   this.hasRendered '+this.hasRendered);
      this.contactRec = JSON.parse(JSON.stringify(this.contactRec));
      console.log('   renderedCallback contactRec ');
      console.log(this.contactRec);
      //console.log('this.contactRec !== {} '+(this.contactRec !== {}));
      if (this.contactRec !== undefined && this.contactRec !== {}) {
        this.setContactRecord(this.contactRec);
      }

      Promise.all([
        //loadScript(this, D3 + '/d3.v5.min.js'),
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
    console.log("event.target.name : " + event.target.name);
    console.log("event.target.value : " + event.target.value);
    this[event.target.name] = event.target.value;
    console.log(" handleOnChange this.firstNameVar " + this.firstNameVar);
    console.log(" handleOnChange this.lastNameVar " + this.lastNameVar);
    console.log(" handleOnChange this.emailVar " + this.emailVar);
    console.log(" handleOnChange this.mobileVar " + this.mobileVar);
    //this.getContactInfo();

    this.checkEnableContinueButton(event);
  }

  checkEnableContinueButton(event) {
    if (
      this.firstNameVar &&
      this.lastNameVar &&
      this.emailVar &&
      this.mobileVar
    ) {
      this.enableContinue(event);
    }
  }

  enableContinue(event) {
    // Creates the event to disable continue event.
    const selectedEvent = new CustomEvent("enablecontinue", {});
    // Dispatches the event.
    this.dispatchEvent(selectedEvent);
  }

  /*contact (fName , lName , email, mobile){
        this.firstName = fName ;
        this.lastName = lName;
        this.email = email;
        this.mobile = mobile;
    }*/
  handleSelection(event) {
    this[event.target.name] = event.target.checked;
    //this.getContactInfo();
  }

  @api
  getContactInfo() {
    const inputComponents = this.template.querySelectorAll("lightning-input");
    inputComponents.forEach(element => {
      console.log(" element.type " + element.type);
      console.log(" element.name " + element.name);
      if (element.type === "checkbox") {
        console.log(" element.checked " + element.checked);
        this[element.name] = element.checked;
      } else {
        console.log(" element.value " + element.value);
        this[element.name] = element.value;
      }
      console.log(" ########## " );
    });

    console.log(" this.firstNameVar " + this.firstNameVar);

    /*
        const checkBoxComponents = this.template.querySelectorAll('input');
        //console.log(" checkBoxComponents "+checkBoxComponents);
        checkBoxComponents.forEach(element => {
            //console.log(" element "+element.name);
            //console.log(" element.checked "+element.checked);
            this[element.name] = element.checked
        });
        */
    let contact = {
      firstName: this.firstNameVar,
      lastName: this.lastNameVar,
      email: this.emailVar,
      mobile: this.mobileVar,
      _acceptedPromotions: this.acceptedPromotions
    };

    console.log(JSON.parse(JSON.stringify(contact)) );

    //new this.contact(this.firstNameVar , this.lastNameVar ,this.emailVar , this.mobileVar);
    return contact;
  }

  setContactRecord(Obj) {
    this.firstNameVar = Obj.firstName !== undefined ? Obj.firstName : "";
    this.lastNameVar = Obj.lastName !== undefined ? Obj.lastName : "";
    this.emailVar = Obj.email !== undefined ? Obj.email : "";
    this.mobileVar = Obj.mobile !== undefined ? Obj.mobile : "";

    this.acceptedPromotions =
      Obj._acceptedPromotions !== undefined ? Obj._acceptedPromotions : false;

      console.log(" ########## this.firstNameVar "+this.firstNameVar );
      console.log(" ########## acceptedPromotions "+this.acceptedPromotions );
      console.log(" ########## this.lastName "+this.lastNameVar );
      console.log(" ########## this.mobileVar "+this.mobileVar );
      console.log(" ########## this.emailVar "+this.emailVar );
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