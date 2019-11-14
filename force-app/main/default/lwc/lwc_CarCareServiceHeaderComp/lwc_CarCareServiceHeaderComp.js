import { LightningElement, wire, track } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';
import { registerListener, unregisterAllListeners } from 'c/pubsub';
export default class lwc_CarCareServiceHeaderComp extends LightningElement {
    @wire(CurrentPageReference) pageRef;
    //@track nextPage = 2;
    //@track previousPage = 1 ;
    @track CurrentPage = 1;
    //maxPages = 5;
    //minPages = 1;

    connectedCallback() {
        // subscribe to searchKeyChange event
        //console.log("buttonPressed registerListener done !!");
        registerListener('buttonClickedEvent', this.handleButtonPressedEvent, this);
        
    }

    disconnectedCallback() {
        // unsubscribe from searchKeyChange event
        unregisterAllListeners(this);
    }

    handleButtonPressedEvent(detail) {
        console.log('##detail.CurrentPage'+detail.CurrentPage);
        this.CurrentPage = detail.CurrentPage;
                //this.searchKey = searchKey;
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
}