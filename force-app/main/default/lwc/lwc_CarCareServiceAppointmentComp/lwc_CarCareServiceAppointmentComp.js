import { LightningElement, track, api } from "lwc";
import carCareResources from "@salesforce/resourceUrl/CarCareReserveService";
import getAvailableAppointmentsInfo from "@salesforce/apex/AppointmentIntegrationServices.getAvailableAppointments";
import { ShowToastEvent } from "lightning/platformShowToastEvent";

export default class lwc_CarCareServiceAppointmentComp extends LightningElement {
  leftArrowURL = carCareResources + "/images/arrowLeft.png";
  rightArrowURL = carCareResources + "/images/arrowRight.png";

  @api storeId = "";
  @api selectedAppointmentObj = {};
  @track selectedDate = "";
  @track selectedHour = "";
  @track selectedActualDate = "";
  @track days = [];
  @track availableHoursWithDatesArr = [];
  @track needTransportationServices = false;
  @track stayWithVehicle = false;
  @track isLoading = true;
  @track error;
  bHours = [] ;
  holidaysList = [] ;

  @track startArrCount = 0;
  @track lastArrCount = 0;
  @track ysArrCount = 0;

  @track currentPaginationColumnCount = 0;
  @track currentPaginationStartColumnCount = 0;
  @track totalColumnCount = 0;

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
    "4:00 P.M.",
    "4:30 P.M."
  ];

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
    '{"days":[{"date":"1/21/2020 12:00:00 AM","openTime":"07:30:00","closeTime":"18:00:00","availableTimes":[]},{"date":"1/22/2020 12:00:00 AM","openTime":"07:30:00","closeTime":"18:00:00","availableTimes":["07:30:00","08:00:00","08:30:00","09:00:00","10:00:00","10:30:00","11:00:00","11:30:00","12:00:00","12:30:00","13:00:00","13:30:00","14:00:00","14:30:00","15:00:00","15:30:00","16:00:00","16:30:00"]},{"date":"1/23/2020 12:00:00 AM","openTime":"07:30:00","closeTime":"18:00:00","availableTimes":["07:30:00","08:00:00","08:30:00","09:00:00","09:30:00","10:00:00","10:30:00","11:00:00","11:30:00","12:00:00","12:30:00","13:00:00","13:30:00","14:00:00","14:30:00","15:00:00","15:30:00","16:00:00","16:30:00"]},{"date":"1/24/2020 12:00:00 AM","openTime":"07:30:00","closeTime":"18:00:00","availableTimes":["07:30:00","08:00:00","08:30:00","09:00:00","09:30:00","10:00:00","10:30:00","11:00:00","11:30:00","12:00:00","12:30:00","13:00:00","13:30:00","14:00:00","14:30:00","15:00:00","15:30:00","16:00:00","16:30:00"]},{"date":"1/25/2020 12:00:00 AM","openTime":"08:00:00","closeTime":"16:00:00","availableTimes":["08:00:00","08:30:00","09:00:00","09:30:00","10:00:00","10:30:00","11:00:00","11:30:00","12:00:00","12:30:00","13:00:00","13:30:00","14:00:00","14:30:00"]},{"date":"1/27/2020 12:00:00 AM","openTime":"07:30:00","closeTime":"18:00:00","availableTimes":["07:30:00","08:00:00","08:30:00","09:00:00","09:30:00","10:00:00","10:30:00","11:00:00","11:30:00","12:00:00","12:30:00","13:00:00","13:30:00","14:00:00","14:30:00","15:00:00","15:30:00","16:00:00","16:30:00"]}]}';
  @track dateTimeResponseObjArr;

  connectedCallback() {
    this.selectedAppointmentObj = JSON.parse(
      JSON.stringify(this.selectedAppointmentObj)
    );
    if (
      this.selectedAppointmentObj === undefined ||
      JSON.stringify(this.selectedAppointmentObj) === JSON.stringify({})
    ) {
      this.getAvailableAppointmentsInfoMethod(0);
      //TODO : Remove below 2 line
      //this.getTestData();
      //this.isLoading = false;
    } else {
      //this.days = this.selectedAppointmentObj._days !== undefined ? this.selectedAppointmentObj._days : [];
      //this.availableHoursWithDatesArr = this.selectedAppointmentObj._availableHoursWithDatesArr !== undefined ? this.selectedAppointmentObj._availableHoursWithDatesArr : [];
      this.selectedDate =
        this.selectedAppointmentObj._selectedDate !== undefined
          ? this.selectedAppointmentObj._selectedDate
          : "";
      this.selectedHour =
        this.selectedAppointmentObj._selectedHour !== undefined
          ? this.selectedAppointmentObj._selectedHour
          : "";
      //this.isLoading = false;

      //TODO : Comment below
      this.getAvailableAppointmentsInfoMethod(0);

      /*console.log('availableHoursWithDatesArr :');
      console.log(JSON.parse(JSON.stringify(this.availableHoursWithDatesArr)));
      let indexVal = 0;
      let finalIndex ;
      this.availableHoursWithDatesArr.forEach(availableHour => {
      console.log('availableHour.hour :');
      console.log(JSON.parse(JSON.stringify(availableHour)));
      console.log(availableHour.hour+"  ===  "+this.selectedHour );
        if(availableHour.hour === this.selectedHour ){
          finalIndex = indexVal;
          availableHour.availableTimes.forEach(availableTime => {
            console.log('availableHour.availableTimes :');
            console.log(JSON.parse(JSON.stringify(availableTime.date)));
            console.log(availableTime.date +"  ===  "+this.selectedDate );
            if(availableTime.date === this.selectedDate){
              availableTime.isSelected = true;
              console.log('availableHour.isSelected ');
            }
          });
        }
        console.log('before indexVal :'+indexVal);
        indexVal++;
        console.log('After indexVal :'+indexVal);
        
      });
      console.log('Has value :');
      let availableSlots = this.template.querySelectorAll(".timeSlot");
      console.log('JSON.parse(JSON.stringify(availableSlots'+JSON.parse(JSON.stringify(availableSlots)));
      if (availableSlots !== undefined && availableSlots.length > 0) {
        for(let i=0 ; i < availableSlots.length ; i++){
          console.log('availableSlots :');
          console.log(JSON.parse(JSON.stringify(availableSlots[i])));
          console.log(availableSlots[i].dataset.date +"  ===  "+this.selectedDate );
          console.log(availableSlots[i].dataset.hour +"  ===  "+this.selectedHour );
          if(availableSlots[i].dataset.date === this.selectedDate && 
            availableSlots[i].dataset.hour === this.selectedHour ){
            availableSlots[i].classList.add("selectedTimeSlot");
          }
          else{
            availableSlots[i].classList.remove("selectedTimeSlot");
          }
        }
        
      }*/
    }
  }

  getAvailableAppointmentsInfoMethod(startCount) {
    this.isLoading = true;
    this.days = [];
    if (
      this.selectedAppointmentObj === undefined ||
      JSON.stringify(this.selectedAppointmentObj) === JSON.stringify({})
    ) {
      getAvailableAppointmentsInfo({ storeId: this.storeId })
      .then(result => {
        if (result !== undefined) {
          let daysArr = result.days !== undefined ? result.days : [];
          let startArrCount = startCount != null ? startCount : 0;
          let lastArrCount = 0;
          let daysArrCount = 0;

          let bHoursJSON =
            result.businessHoursJSON !== undefined
              ? result.businessHoursJSON
              : "{}";
          this.bHours = JSON.parse(bHoursJSON);

          let holidaysDateFormat =
            result.holidays !== undefined ? result.holidays : [];
          this.holidaysList = [];
          holidaysDateFormat.forEach(h => {
            let holiday = new Date(
              h.split("-")[0],
              h.split("-")[1] - 1,
              h.split("-")[2]
            );
            let holidayDate =
              this.weekday[holiday.getDay()] +
              " " +
              holiday.getDate() +
              " " +
              this.monthStr[holiday.getMonth()];
            this.holidaysList.push(holidayDate);
          });
          if (
            this.isMobile.Android() ||
            this.isMobile.BlackBerry() ||
            this.isMobile.iOS() ||
            this.isMobile.Opera() ||
            this.isMobile.Windows()
          ) {
            //this.showMobile = true;
            this.numberOfColsToDisplay =
              result.paginationForMobile !== undefined
                ? result.paginationForMobile
                : 2;
          } else if (this.isMobile.ipad()) {
            this.numberOfColsToDisplay =
              result.paginationForTablet !== undefined
                ? result.paginationForTablet
                : 4;
          } else {
            this.numberOfColsToDisplay =
              result.paginationForLaptop !== undefined
                ? result.paginationForLaptop
                : 5;
          }

          lastArrCount = startArrCount + this.numberOfColsToDisplay;
          this.currentPaginationStartColumnCount = startArrCount;
          this.currentPaginationColumnCount = lastArrCount;

          this.totalColumnCount = 0;
          daysArr.forEach(daysElement => {
            this.totalColumnCount++;
          });

          daysArr.forEach(daysElement => {
            if (startArrCount <= daysArrCount && daysArrCount < lastArrCount) {
              let daysObj = {};
              let myDate = new Date(daysElement.dateVal);
              daysObj._myDate = daysElement.dateVal;
              daysObj.date =
                this.weekday[myDate.getDay()] +
                " " +
                myDate.getDate() +
                " " +
                this.monthStr[myDate.getMonth()];
              if (this.holidaysList.includes(daysObj.date)) {
                daysObj.openCloseTimings = "Holiday";
                //daysObj.closeTime = "";
              } else {
                let openTime = this.strToTime(daysElement.openTime, "h:m:s");
                let closeTime = this.strToTime(daysElement.closeTime, "h:m:s");
                daysObj.openCloseTimings = openTime + " - " + closeTime;
              }
              daysObj.availableTimes = daysElement.availableTimes;
              this.days.push(daysObj);
            }
            daysArrCount++;
          });
          
          this.getAvailableHoursWithDatesArr(this.bHours , this.holidaysList);
          /*
          this.hours.forEach(hourElement => {
            let availableHoursWithDates = {};
            availableHoursWithDates.hour = hourElement;
            let availableHoursPerDateArr = [];

            this.days.forEach(dayElement => {
              let formattedAvailableTimes = [];
              dayElement.availableTimes.forEach(availableTimeSlot => {
                formattedAvailableTimes.push(
                  this.strToTime(availableTimeSlot, "h:m:s")
                );
              });
              let availableHoursPerDate = {};
              availableHoursPerDate.date = dayElement.date;
              availableHoursPerDate.isSelected = false;
              let startTime;
              let endTime;
              startTime = this.getStartTime(bHours, dayElement.date);
              endTime = this.getEndTime(bHours, dayElement.date);
              if (
                this.checkTimeIsInRange(startTime, endTime, hourElement) ===
                "true"
              ) {
                availableHoursPerDate.withInBusinessHours = true;
              } else {
                availableHoursPerDate.withInBusinessHours = false;
              }
              if (formattedAvailableTimes.includes(hourElement)) {
                availableHoursPerDate.isAvailable = true;
                if (
                  this.selectedDate === dayElement.date &&
                  this.selectedHour === hourElement
                ) {
                  availableHoursPerDate.isSelected = true;
                }
              } else {
                availableHoursPerDate.isAvailable = false;
              }
              //check holidays and make hours unavialable
              if (holidaysList.includes(dayElement.date)) {
                availableHoursPerDate.isAvailable = false;
              }

              availableHoursPerDateArr.push(availableHoursPerDate);
            });
            availableHoursWithDates.availableTimes = availableHoursPerDateArr;
            if (
              !this.availableHoursWithDatesArr.includes(availableHoursWithDates)
            ) {
              this.availableHoursWithDatesArr.push(availableHoursWithDates);
            }
          });*/
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
    else{
      this.selectedDate =
        this.selectedAppointmentObj._selectedDate !== undefined
          ? this.selectedAppointmentObj._selectedDate
          : "";
      this.selectedHour =
        this.selectedAppointmentObj._selectedHour !== undefined
          ? this.selectedAppointmentObj._selectedHour
          : "";
      
      this.bHours = 
        this.selectedAppointmentObj._bHours !== undefined
          ? this.selectedAppointmentObj._bHours
          : [];

      this.holidaysList = 
        this.selectedAppointmentObj._holidaysList !== undefined
          ? this.selectedAppointmentObj._holidaysList
          : [];    

      this.stayWithVehicle = 
        this.selectedAppointmentObj._stayWithVehicle !== undefined
          ? this.selectedAppointmentObj._stayWithVehicle
          : false; 

      this.needTransportationServices = 
        this.selectedAppointmentObj._needTransportationServices !== undefined
          ? this.selectedAppointmentObj._needTransportationServices
          : false; 

            
      this.getAvailableHoursWithDatesArr(this.bHours , this.holidaysList);

      this.isLoading = false;
      this.error = undefined;
    }
    
  }

  getAvailableHoursWithDatesArr(bHours , holidaysList){
    this.hours.forEach(hourElement => {
      let availableHoursWithDates = {};
      availableHoursWithDates.hour = hourElement;
      let availableHoursPerDateArr = [];

      this.days.forEach(dayElement => {
        let formattedAvailableTimes = [];
        dayElement.availableTimes.forEach(availableTimeSlot => {
          formattedAvailableTimes.push(
            this.strToTime(availableTimeSlot, "h:m:s")
          );
        });
        let availableHoursPerDate = {};
        availableHoursPerDate.date = dayElement.date;
        availableHoursPerDate.actualDate = dayElement._myDate;
        availableHoursPerDate.isSelected = false;
        let startTime;
        let endTime;
        startTime = this.getStartTime(bHours, dayElement.date);
        endTime = this.getEndTime(bHours, dayElement.date);
        if (
          this.checkTimeIsInRange(startTime, endTime, hourElement) ===
          "true"
        ) {
          availableHoursPerDate.withInBusinessHours = true;
        } else {
          availableHoursPerDate.withInBusinessHours = false;
        }
        if (formattedAvailableTimes.includes(hourElement)) {
          availableHoursPerDate.isAvailable = true;
          if (
            this.selectedDate === dayElement.date &&
            this.selectedHour === hourElement
          ) {
            availableHoursPerDate.isSelected = true;
          }
        } else {
          availableHoursPerDate.isAvailable = false;
        }
        //check holidays and make hours unavialable
        if (holidaysList.includes(dayElement.date)) {
          availableHoursPerDate.isAvailable = false;
        }

        availableHoursPerDateArr.push(availableHoursPerDate);
      });
      availableHoursWithDates.availableTimes = availableHoursPerDateArr;
      if (
        !this.availableHoursWithDatesArr.includes(availableHoursWithDates)
      ) {
        this.availableHoursWithDatesArr.push(availableHoursWithDates);
      }
    });
  }

  getPreviousList() {
    if (this.currentPaginationStartColumnCount !== 0) {
      this.availableHoursWithDatesArr = [];
      this.getAvailableAppointmentsInfoMethod(
        this.currentPaginationStartColumnCount - this.numberOfColsToDisplay
      );
    }
  }
  getNextList() {
    if (this.currentPaginationColumnCount < this.totalColumnCount) {
      this.availableHoursWithDatesArr = [];
      this.getAvailableAppointmentsInfoMethod(
        this.currentPaginationColumnCount
      );
    }
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
    if (format === "h:m:s") {
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

  getStartTime(bHours, date) {
    let startTime;
    let weekdayOfDate = date.substring(0, 3);
    if (weekdayOfDate === "Mon") {
      startTime = bHours.mondayStartTime;
    } else if (weekdayOfDate === "Tue") {
      startTime = bHours.tuesdayStartTime;
    } else if (weekdayOfDate === "Wed") {
      startTime = bHours.wednesdayStartTime;
    } else if (weekdayOfDate === "Thu") {
      startTime = bHours.thursdayStartTime;
    } else if (weekdayOfDate === "Fri") {
      startTime = bHours.fridayStartTime;
    } else if (weekdayOfDate === "Sat") {
      startTime = bHours.saturdayStartTime;
    }
    return startTime;
  }
  getEndTime(bHours, date) {
    let endTime;
    let weekdayOfDate = date.substring(0, 3);
    if (weekdayOfDate === "Mon") {
      endTime = bHours.mondayEndTime;
    } else if (weekdayOfDate === "Tue") {
      endTime = bHours.tuesdayEndTime;
    } else if (weekdayOfDate === "Wed") {
      endTime = bHours.wednesdayEndTime;
    } else if (weekdayOfDate === "Thu") {
      endTime = bHours.thursdayEndTime;
    } else if (weekdayOfDate === "Fri") {
      endTime = bHours.fridayEndTime;
    } else if (weekdayOfDate === "Sat") {
      endTime = bHours.saturdayEndTime;
    }
    return endTime;
  }

  checkTimeIsInRange(startTime, endTime, checkTime) {
    var hoursToadd = 0;
    if (
      startTime !== undefined &&
      endTime !== undefined &&
      checkTime !== undefined
    ) {
      console.log(
        "stime--" + startTime + "--ctime--" + checkTime + "--etime--" + endTime
      );
      let isNoon = startTime.substr(0, startTime.indexOf(":")) != 12;
      if (
        startTime.substr(startTime.indexOf(" ") + 1, 4) === "P.M." &&
        isNoon
      ) {
        hoursToadd = 12;
      }
      let stime = new Date();
      stime.setHours(startTime.substr(0, startTime.indexOf(":")) + hoursToadd);
      stime.setMinutes(startTime.substr(startTime.indexOf(":") + 1, 2));
      stime.setSeconds(0);

      hoursToadd = 0;
      isNoon = endTime.substr(0, endTime.indexOf(":")) != 12;
      if (endTime.substr(endTime.indexOf(" ") + 1, 4) === "P.M." && isNoon) {
        hoursToadd = 12;
      }
      let etime = new Date();
      etime.setHours(endTime.substr(0, endTime.indexOf(":")) + hoursToadd);
      etime.setMinutes(endTime.substr(endTime.indexOf(":") + 1, 2));
      etime.setSeconds(0);

      hoursToadd = 0;
      isNoon = checkTime.substr(0, checkTime.indexOf(":")) != 12;
      if (
        checkTime.substr(checkTime.indexOf(" ") + 1, 4) === "P.M." &&
        isNoon
      ) {
        hoursToadd = 12;
      }
      let ctime = new Date();
      ctime.setHours(checkTime.substr(0, checkTime.indexOf(":")) + hoursToadd);
      ctime.setMinutes(checkTime.substr(checkTime.indexOf(":") + 1, 2));
      ctime.setSeconds(0);

      if (stime <= ctime && ctime <= etime) {
        return "true";
      } 
      else {
        return "false";
      }
    }
    return "false";
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
    this.selectedDate = event.currentTarget.dataset.date;
    this.selectedHour = event.currentTarget.dataset.hour;
    this.selectedActualDate = event.currentTarget.dataset.actualDate;
  }

  @api
  getAppointmentInfo() {
    this.selectedAppointmentObj = {
      _day: this.days,
      _hours: this.hours,
      _availableHoursWithDatesArr: this.availableHoursWithDatesArr,
      _selectedDate: this.selectedDate,
      _selectedHour: this.selectedHour,
      _selectedActualDate : this.selectedActualDate,
      _bHours : this.bHours,
      _holidaysList : this.holidaysList,
      _stayWithVehicle : this.stayWithVehicle,
      _needTransportationServices : this.needTransportationServices,
      _response:
        this.stayWithVehicle === true
          ? "I’m going to stay with the vehicle during service."
          : this.needTransportationServices === true 
          ? "I need transportation services." : ""
    };
    return this.selectedAppointmentObj;
  }

  get isLoaded() {
    return this.isLoading ? false : true;
  }

  dateTimeCheckBoxToggle(event) {
    console.log("dateTimeCheckBoxToggle "+  event.target.name);
    if (event.target.name === "stayWithVehicle" && event.target.checked) {
      //check the stay with vehicle
      /*console.log("stayWithVehicle : check the stay with vehicle "+  event.target.name);
      const stayWithVehicleChkBox = this.template.querySelector(
        'lightning-input[data-name="' + event.target.name + '"]'
      );
      stayWithVehicleChkBox.checked = true;*/
      this.stayWithVehicle = true;
      //uncheck need transportation
      /*console.log("uncheck need transportation "+  event.target.name);
      const needTransapotationChkBox = this.template.querySelector(
        'lightning-input[data-name="' + event.target.name + '"]'
      );
      needTransapotationChkBox.checked = false;*/
      this.needTransportationServices = false;
    } else if (
      event.target.name === "needTransportationServices" &&
      event.target.checked
    ) {
      //check need transportation
      /*console.log("needTransportationServices : check need transportation "+  event.target.name);
      const needTransapotationChkBox = this.template.querySelector(
        'lightning-input[data-name="' + event.target.name + '"]'
      );
      needTransapotationChkBox.checked = true;*/
      this.needTransportationServices = true;
      //uncheck stay with vehicle
      /*console.log("needTransportationServices : uncheck stay with vehicle "+  event.target.name);
      const stayWithVehicleChkBox = this.template.querySelector(
        'lightning-input[data-name="' + event.target.name + '"]'
      );
      stayWithVehicleChkBox.checked = false;*/
      this.stayWithVehicle = false;
    }
  }
}