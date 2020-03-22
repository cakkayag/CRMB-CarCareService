import { LightningElement, api } from "lwc";

export default class lwc_CarCareServiceConfirmationComp extends LightningElement {
  @api storeLocationReview = "";
  @api contactInfoReview = "";
  @api serviceRequestReview = "";
  @api dateTimeReview = "";
  @api vehicleInfoReview = "";

  navigateToEdit(event) {
    // Creates the event with the contact ID data.
    const selectedEvent = new CustomEvent("editinfo", {
      detail: event.target.dataset.naviagateId
    });
    // Dispatches the event.
    this.dispatchEvent(selectedEvent);
  }
}