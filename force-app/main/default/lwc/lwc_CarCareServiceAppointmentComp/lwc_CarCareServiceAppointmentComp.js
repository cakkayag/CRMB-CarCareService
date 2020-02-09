import { LightningElement, track, api } from "lwc";
import carCareResources from "@salesforce/resourceUrl/CarCareReserveService";
import getAvailableAppointmentsInfo from "@salesforce/apex/AppointmentIntegrationServices.getAvailableAppointments";
import { ShowToastEvent } from "lightning/platformShowToastEvent";

export default class lwc_CarCareServiceAppointmentComp extends LightningElement {
  leftArrowURL = carCareResources + "/images/arrowLeft.png";
  rightArrowURL = carCareResources + "/images/arrowRight.png";

  @api storeId = "";
  @api selectedAppointmentObj = {};

  @track needTransportationServices = false;
  @track stayWithVehicle = false;

  @track days = [];
  @track availableHoursWithDatesArr = [];
  @track hours = [
    "7:30 A.M.",
    "8:00 A.M.",
    "8:30 A.M.",
    "9:00 A.M.",
    "9:30 A.M.",
    "10:00 A.M.",
    "10:30 A.M.",
    "11:00 A.M.",
    "11:30 A.M.",
    "12:00 P.M.",
    "12:30 P.M.",
    "1:00 P.M.",
    "1:30 P.M.",
    "2:00 P.M.",
    "2:30 P.M.",
    "3:00 P.M.",
    "3:30 P.M.",
    "4:00 P.M."
  ];
  @track isLoading = true;
  @track error;

  weekday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  monthStr = [
    "JAN",
    "FEB",
    "MAR",
    "APR",
    "MAY",
    "JUN",
    "JUL",
    "AUG",
    "SEP",
    "OCT",
    "NOV",
    "DEC"
  ];

  @api isMobile = {
    Android: function() {
      return navigator.userAgent.match(/Android/i);
    },
    BlackBerry: function() {
      return navigator.userAgent.match(/BlackBerry/i);
    },
    iOS: function() {
      return navigator.userAgent.match(/iPhone|iPod/i); //return navigator.userAgent.match(/iPhone|iPad|iPod/i);
    },
    ipad: function() {
      return navigator.userAgent.match(/iPad/i);
    },
    Opera: function() {
      return navigator.userAgent.match(/Opera Mini/i);
    },
    Windows: function() {
      return (
        navigator.userAgent.match(/IEMobile/i) ||
        navigator.userAgent.match(/WPDesktop/i)
      );
    }
  };

  @api showMobile = false;
  @api numberOfColsToDisplay = 5;

  @track dateTimeResponse =
    '{"days":[{"date":"1/21/2020 12:00:00 AM","openTime":"07:30:00","closeTime":"18:00:00","availableTimes":[]},{"date":"1/22/2020 12:00:00 AM","openTime":"07:30:00","closeTime":"18:00:00","availableTimes":["07:30:00","08:00:00","08:30:00","09:00:00","09:30:00","10:00:00","10:30:00","11:00:00","11:30:00","12:00:00","12:30:00","13:00:00","13:30:00","14:00:00","14:30:00","15:00:00","15:30:00","16:00:00","16:30:00"]},{"date":"1/23/2020 12:00:00 AM","openTime":"07:30:00","closeTime":"18:00:00","availableTimes":["07:30:00","08:00:00","08:30:00","09:00:00","09:30:00","10:00:00","10:30:00","11:00:00","11:30:00","12:00:00","12:30:00","13:00:00","13:30:00","14:00:00","14:30:00","15:00:00","15:30:00","16:00:00","16:30:00"]},{"date":"1/24/2020 12:00:00 AM","openTime":"07:30:00","closeTime":"18:00:00","availableTimes":["07:30:00","08:00:00","08:30:00","09:00:00","09:30:00","10:00:00","10:30:00","11:00:00","11:30:00","12:00:00","12:30:00","13:00:00","13:30:00","14:00:00","14:30:00","15:00:00","15:30:00","16:00:00","16:30:00"]},{"date":"1/25/2020 12:00:00 AM","openTime":"08:00:00","closeTime":"16:00:00","availableTimes":["08:00:00","08:30:00","09:00:00","09:30:00","10:00:00","10:30:00","11:00:00","11:30:00","12:00:00","12:30:00","13:00:00","13:30:00","14:00:00","14:30:00"]},{"date":"1/27/2020 12:00:00 AM","openTime":"07:30:00","closeTime":"18:00:00","availableTimes":["07:30:00","08:00:00","08:30:00","09:00:00","09:30:00","10:00:00","10:30:00","11:00:00","11:30:00","12:00:00","12:30:00","13:00:00","13:30:00","14:00:00","14:30:00","15:00:00","15:30:00","16:00:00","16:30:00"]}]}';
  @track dateTimeResponseObjArr;

  connectedCallback() {
    if (
      this.isMobile.Android() ||
      this.isMobile.BlackBerry() ||
      this.isMobile.iOS() ||
      this.isMobile.Opera() ||
      this.isMobile.Windows()
    ) {
      //this.showMobile = true;
      this.numberOfColsToDisplay = 2;
    } else if (this.isMobile.ipad()) {
      this.numberOfColsToDisplay = 4;
    } else {
      this.numberOfColsToDisplay = 5;
    }

    if (this.selectedAppointmentObj !== undefined) {
      //this.getAvailableAppointmentsInfoMethod();
      this.getTestData();
    }
  }

  getTestData() {
    this.dateTimeResponseObj = JSON.parse(this.dateTimeResponse);

    let daysArr = this.dateTimeResponseObj.days;
    let daysArrCount = 0;

    daysArr.forEach(daysElement => {
      if (daysArrCount < this.numberOfColsToDisplay) {
        let daysObj = new Object();
        let myDate = new Date(daysElement.date);
        daysObj.date =
          this.weekday[myDate.getDay()] +
          " " +
          myDate.getDate() +
          " " +
          this.monthStr[myDate.getMonth()];
        daysObj.openTime = this.strToTime(daysElement.openTime, "h:m:s");
        daysObj.closeTime = this.strToTime(daysElement.closeTime, "h:m:s");
        daysObj.availableTimes = daysElement.availableTimes;
        this.days.push(daysObj);
        daysArrCount++;
      }
    });

    this.hours.forEach(hourElement => {
      let availableHoursWithDates = new Object();
      availableHoursWithDates.hour = hourElement;
      let availableHoursPerDateArr = [];
      this.days.forEach(dayElement => {
        let formattedAvailableTimes = [];
        dayElement.availableTimes.forEach(availableTimeSlot => {
          formattedAvailableTimes.push(
            this.strToTime(availableTimeSlot, "h:m:s")
          );
        });
        let availableHoursPerDate = new Object();
        availableHoursPerDate.date = dayElement.date;
        if (formattedAvailableTimes.includes(hourElement)) {
          availableHoursPerDate.isAvailable = true;
        } else {
          availableHoursPerDate.isAvailable = false;
        }
        availableHoursPerDateArr.push(availableHoursPerDate);
      });
      availableHoursWithDates.availableTimes = availableHoursPerDateArr;
      if (!this.availableHoursWithDatesArr.includes(availableHoursWithDates))
        this.availableHoursWithDatesArr.push(availableHoursWithDates);
    });
  }

  getAvailableAppointmentsInfoMethod() {
    this.isLoading = true;
    getAvailableAppointmentsInfo({ storeId: this.storeId })
      .then(result => {
        if (result !== undefined && result.days !== undefined) {
          let daysArrCount = 0;
          let numberOfColsToDisplay = this.showMobile
            ? result.paginationForMobile
            : result.pagination_for_Laptop; // need to change as line number 63-69
          result.days.forEach(element => {
            if (daysArrCount < numberOfColsToDisplay) {
              let daysObj = {};
              let myDate = new Date(element.date);
              daysObj.date =
                this.weekday[myDate.getDay()] +
                " " +
                myDate.getDate() +
                " " +
                this.monthStr[myDate.getMonth()];
              //daysObj.date = daysElement.date;
              daysObj.openTime = this.strToTime(element.openTime, "h:m:s"); //element.openTime;
              daysObj.closeTime = this.strToTime(element.closeTime, "h:m:s"); //element.closeTime;
              this.days.push(daysObj);
              daysArrCount++;
            }
          });
          this.isLoading = false;
          this.error = undefined;
        } else {
          this.error = "No Records found";
          this.isLoading = false;
          this.showToast(
            "Error",
            "Error Occured while fetching Store Info ( " +
              this.error +
              " ), Please contact Support team",
            "Error",
            "sticky"
          );
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

  strToTime(dStr, format) {
    var dt = new Date();
    if (format == "h:m:s") {
      dt.setHours(dStr.substr(0, dStr.indexOf(":")));
      dt.setMinutes(dStr.substr(this.getPosition(dStr, ":", 1) + 1, 2));
      dt.setSeconds(0);
      let hours = dt.getHours(); // gives the value in 24 hours format
      let AmOrPm = hours >= 12 ? "P.M." : "A.M.";
      hours = hours % 12 || 12;
      let minutes = (dt.getMinutes() < 10 ? "0" : "") + dt.getMinutes(); //dt.getMinutes() ;
      let finalTime = hours + ":" + minutes + " " + AmOrPm;
      return finalTime;
    }
    return "Invalid Format";
  }
  getPosition(string, subString, index) {
    return string.split(subString, index).join(subString).length;
  }
  selectTimeSlot(event) {
    let selectedSlots = this.template.querySelectorAll(".selectedTimeSlot");
    if (selectedSlots.length > 0) {
      selectedSlots[0].classList.remove("selectedTimeSlot");
    }
    event.currentTarget.classList.add("selectedTimeSlot");
  }
}