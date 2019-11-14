import { LightningElement, wire, track } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';
import { fireEvent } from 'c/pubsub';

export default class lwc_CarCareSericeBaseComp extends LightningElement {
    @wire(CurrentPageReference) pageRef;
    @track nextPage = 2;
    @track previousPage = 1 ;
    @track CurrentPage = 1;
    maxPages = 5;
    minPages = 1;

    handleContinue(event) {
        //console.log("nextPage"+this.nextPage);
        this.previousPage = this.CurrentPage;
        this.CurrentPage = this.nextPage ;
        this.nextPage = this.nextPage < this.maxPages ? this.nextPage + 1 : this.nextPage ;
        fireEvent(this.pageRef, 'buttonClickedEvent', this);
    }

    handlePrevious(event) {
        //console.log("nextPage"+this.previousPage);
        this.nextPage = this.CurrentPage ;
        this.CurrentPage = this.previousPage;
        this.previousPage = this.previousPage > this.minPages ? this.previousPage - 1 : this.previousPage ;
        fireEvent(this.pageRef, 'buttonClickedEvent', this);
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

    get showPrevious() {
        return (this.CurrentPage > this.minPages) ? false : true;
    }

    get showContinue() {
        return (this.CurrentPage < this.maxPages) ? false : true;
    }

}