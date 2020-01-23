import { LightningElement, track } from "lwc";

export default class lwc_CarCareServiceAppointmentComp extends LightningElement {
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

  @track dateTimeResponse =
    '{"days":[{"date":"1/21/2020 12:00:00 AM","openTime":"07:30:00","closeTime":"18:00:00","availableTimes":["07:30:00","08:00:00","08:30:00","09:00:00","09:30:00","10:00:00","10:30:00","11:00:00","11:30:00","12:00:00","12:30:00","13:00:00","13:30:00","14:00:00","14:30:00","15:00:00","15:30:00","16:00:00","16:30:00"]},{"date":"1/22/2020 12:00:00 AM","openTime":"07:30:00","closeTime":"18:00:00","availableTimes":["07:30:00","08:00:00","08:30:00","09:00:00","09:30:00","10:00:00","10:30:00","11:00:00","11:30:00","12:00:00","12:30:00","13:00:00","13:30:00","14:00:00","14:30:00","15:00:00","15:30:00","16:00:00","16:30:00"]},{"date":"1/23/2020 12:00:00 AM","openTime":"07:30:00","closeTime":"18:00:00","availableTimes":["07:30:00","08:00:00","08:30:00","09:00:00","09:30:00","10:00:00","10:30:00","11:00:00","11:30:00","12:00:00","12:30:00","13:00:00","13:30:00","14:00:00","14:30:00","15:00:00","15:30:00","16:00:00","16:30:00"]},{"date":"1/24/2020 12:00:00 AM","openTime":"07:30:00","closeTime":"18:00:00","availableTimes":["07:30:00","08:00:00","08:30:00","09:00:00","09:30:00","10:00:00","10:30:00","11:00:00","11:30:00","12:00:00","12:30:00","13:00:00","13:30:00","14:00:00","14:30:00","15:00:00","15:30:00","16:00:00","16:30:00"]},{"date":"1/25/2020 12:00:00 AM","openTime":"08:00:00","closeTime":"16:00:00","availableTimes":["08:00:00","08:30:00","09:00:00","09:30:00","10:00:00","10:30:00","11:00:00","11:30:00","12:00:00","12:30:00","13:00:00","13:30:00","14:00:00","14:30:00"]},{"date":"1/27/2020 12:00:00 AM","openTime":"07:30:00","closeTime":"18:00:00","availableTimes":["07:30:00","08:00:00","08:30:00","09:00:00","09:30:00","10:00:00","10:30:00","11:00:00","11:30:00","12:00:00","12:30:00","13:00:00","13:30:00","14:00:00","14:30:00","15:00:00","15:30:00","16:00:00","16:30:00"]}]}';
  @track dateTimeResponseObjArr;
  //onLoadMethod();
  connectedCallback() {
    this.dateTimeResponseObj = JSON.parse(this.dateTimeResponse);
    let daysArr = this.dateTimeResponseObj.days;

    daysArr.forEach(daysElement => {
      var daysObj = new Object();
      daysObj.date = daysElement.date;
      daysObj.openTime = daysElement.openTime;
      daysObj.closeTime = daysElement.closeTime;
      this.days.push(daysObj);
      //this.days.push(daysElement.date);
    });
    console.log("--" + this.days);
  }
}