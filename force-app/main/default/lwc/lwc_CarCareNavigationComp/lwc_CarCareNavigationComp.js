import { LightningElement, wire, track } from "lwc";
import { registerListener, unregisterAllListeners } from "c/pubsub";
import { CurrentPageReference } from "lightning/navigation";

export default class lwc_CarCareNavigationComp extends LightningElement {
  @wire(CurrentPageReference) pageRef;
  @track currentSelection = 1;
  previousSelection = 1;

  connectedCallback() {
    // subscribe to searchKeyChange event
    registerListener("buttonClickedEvent", this.handleButtonPressedEvent, this);
  }

  disconnectedCallback() {
    // unsubscribe from searchKeyChange event
    unregisterAllListeners(this);
  }

  handleButtonPressedEvent(detail) {
    this.currentSelection = detail.CurrentPage;
  }

  get showFirstPage_Normal() {
    return this.currentSelection < 1 ? true : false;
  }

  get showFirstPage_Ellipse() {
    return this.currentSelection === 1 ? true : false;
  }

  get showFirstPage_Highlighted() {
    return this.currentSelection > 1 ? true : false;
  }

  get showSecondPage_Normal() {
    return this.currentSelection < 2 ? true : false;
  }

  get showSecondPage_Ellipse() {
    return this.currentSelection === 2 ? true : false;
  }

  get showSecondPage_Highlighted() {
    return this.currentSelection > 2 ? true : false;
  }

  get showThirdPage_Normal() {
    return this.currentSelection < 3 ? true : false;
  }

  get showThirdPage_Ellipse() {
    return this.currentSelection === 3 ? true : false;
  }

  get showThirdPage_Highlighted() {
    return this.currentSelection > 3 ? true : false;
  }

  get showFourthPage_Normal() {
    return this.currentSelection < 4 ? true : false;
  }

  get showFourthPage_Ellipse() {
    return this.currentSelection === 4 ? true : false;
  }

  get showFourthPage_Highlighted() {
    return this.currentSelection > 4 ? true : false;
  }

  get showFifthPage_Normal() {
    return this.currentSelection < 5 ? true : false;
  }

  get showFifthPage_Ellipse() {
    return this.currentSelection === 5 ? true : false;
  }

  get showFifthPage_Highlighted() {
    return this.currentSelection > 5 ? true : false;
  }

  get showSixthPage_Normal() {
    return this.currentSelection < 6 ? true : false;
  }

  get showSixthPage_Ellipse() {
    return this.currentSelection === 6 ? true : false;
  }

  get showSixthPage_Highlighted() {
    return this.currentSelection > 6 ? true : false;
  }
}