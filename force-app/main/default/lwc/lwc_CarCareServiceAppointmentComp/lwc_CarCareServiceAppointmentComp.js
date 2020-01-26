import { LightningElement, track, api } from "lwc";
import carCareResources from "@salesforce/resourceUrl/CarCareReserveService";
import getAvailableAppointmentsInfo from "@salesforce/apex/AppointmentIntegrationServices.getAvailableAppointments";
import { ShowToastEvent } from "lightning/platformShowToastEvent";

export default class lwc_CarCareServiceAppointmentComp extends LightningElement {
  leftArrowURL = carCareResources + "/images/arrowLeft.png";
  rightArrowURL = carCareResources + "/images/arrowRight.png";
  @api storeId = '';

  @track days = []; //["25 Mar", "26 Mar", "27 Mar", "28 Mar", "29 Mar"];
  @track hours = [
    "8 AM",
    "9 AM",
    "10 AM",
    "11 AM",
    "12 PM",
    "1 PM",
    "2 PM",
    "3 PM",
    "4 PM",
    "5 PM",
    "6 PM",
    "7 PM",
    "8 PM"
  ];

  @api isMobile = {
    Android: function() {
      return navigator.userAgent.match(/Android/i);
    },
    BlackBerry: function() {
      return navigator.userAgent.match(/BlackBerry/i);
    },
    iOS: function() {
      return navigator.userAgent.match(/iPhone|iPad|iPod/i);
    },
    Opera: function() {
      return navigator.userAgent.match(/Opera Mini/i);
    },
    Windows: function() {
      return (
        navigator.userAgent.match(/IEMobile/i) ||
        navigator.userAgent.match(/WPDesktop/i)
      );
    } /*,
    any: function() {
      return (
        isMobile.Android() ||
        isMobile.BlackBerry() ||
        isMobile.iOS() ||
        isMobile.Opera() ||
        isMobile.Windows()
      );
    }*/
  };
  @api showMobile = false;

  @track dateTimeResponse =
    '{"days":[{"date":"1/21/2020 12:00:00 AM","openTime":"07:30:00","closeTime":"18:00:00","availableTimes":["07:30:00","08:00:00","08:30:00","09:00:00","09:30:00","10:00:00","10:30:00","11:00:00","11:30:00","12:00:00","12:30:00","13:00:00","13:30:00","14:00:00","14:30:00","15:00:00","15:30:00","16:00:00","16:30:00"]},{"date":"1/22/2020 12:00:00 AM","openTime":"07:30:00","closeTime":"18:00:00","availableTimes":["07:30:00","08:00:00","08:30:00","09:00:00","09:30:00","10:00:00","10:30:00","11:00:00","11:30:00","12:00:00","12:30:00","13:00:00","13:30:00","14:00:00","14:30:00","15:00:00","15:30:00","16:00:00","16:30:00"]},{"date":"1/23/2020 12:00:00 AM","openTime":"07:30:00","closeTime":"18:00:00","availableTimes":["07:30:00","08:00:00","08:30:00","09:00:00","09:30:00","10:00:00","10:30:00","11:00:00","11:30:00","12:00:00","12:30:00","13:00:00","13:30:00","14:00:00","14:30:00","15:00:00","15:30:00","16:00:00","16:30:00"]},{"date":"1/24/2020 12:00:00 AM","openTime":"07:30:00","closeTime":"18:00:00","availableTimes":["07:30:00","08:00:00","08:30:00","09:00:00","09:30:00","10:00:00","10:30:00","11:00:00","11:30:00","12:00:00","12:30:00","13:00:00","13:30:00","14:00:00","14:30:00","15:00:00","15:30:00","16:00:00","16:30:00"]},{"date":"1/25/2020 12:00:00 AM","openTime":"08:00:00","closeTime":"16:00:00","availableTimes":["08:00:00","08:30:00","09:00:00","09:30:00","10:00:00","10:30:00","11:00:00","11:30:00","12:00:00","12:30:00","13:00:00","13:30:00","14:00:00","14:30:00"]},{"date":"1/27/2020 12:00:00 AM","openTime":"07:30:00","closeTime":"18:00:00","availableTimes":["07:30:00","08:00:00","08:30:00","09:00:00","09:30:00","10:00:00","10:30:00","11:00:00","11:30:00","12:00:00","12:30:00","13:00:00","13:30:00","14:00:00","14:30:00","15:00:00","15:30:00","16:00:00","16:30:00"]}]}';
  @track dateTimeResponseObjArr;
  //onLoadMethod();
  connectedCallback() {
    if (
      this.isMobile.Android() ||
      this.isMobile.BlackBerry() ||
      this.isMobile.iOS() ||
      this.isMobile.Opera() ||
      this.isMobile.Windows()
    ) {
      this.showMobile = true;
    }

    this.dateTimeResponseObj = JSON.parse(this.dateTimeResponse);

    let weekday = new Array(7);
    weekday[0] = "Sun";
    weekday[1] = "Mon";
    weekday[2] = "Tue";
    weekday[3] = "Wed";
    weekday[4] = "Thu";
    weekday[5] = "Fri";
    weekday[6] = "Sat";

    let monthStr = new Array(12);
    monthStr[0] = "JAN";
    monthStr[1] = "FEB";
    monthStr[2] = "MAR";
    monthStr[3] = "APR";
    monthStr[4] = "MAY";
    monthStr[5] = "JUN";
    monthStr[6] = "JUL";
    monthStr[7] = "AUG";
    monthStr[8] = "SEP";
    monthStr[9] = "OCT";
    monthStr[10] = "NOV";
    monthStr[11] = "DEC";

    let numberOfColsToDisplay = this.showMobile ? 2 : 5;

    let daysArr = this.dateTimeResponseObj.days;
    let daysArrCount = 0;

    daysArr.forEach(daysElement => {
      if (daysArrCount < numberOfColsToDisplay) {
        let daysObj = new Object();
        let myDate = new Date(daysElement.date);
        daysObj.date =
          weekday[myDate.getDay()] +
          " " +
          myDate.getDate() +
          " " +
          monthStr[myDate.getMonth()];
        //daysObj.date = daysElement.date;
        daysObj.openTime = daysElement.openTime;
        daysObj.closeTime = daysElement.closeTime;
        this.days.push(daysObj);
        daysArrCount++;
      }
      //this.days.push(daysElement.date);
    });
    console.log("--" + this.days);
  }

  getAvailableAppointmentsInfoMethod(){
    this.isLoading = true;
    getAvailableAppointmentsInfo({ storeId: this.storeId })
      .then(result => {
        if (result !== undefined) {
          result.forEach(element => {
        
          })
        
        this.isLoading = false;
        this.error = undefined;
        }
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