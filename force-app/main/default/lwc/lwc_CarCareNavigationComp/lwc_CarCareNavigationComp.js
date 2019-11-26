import { LightningElement, wire, track } from 'lwc';
import { fireEvent } from 'c/pubsub';
import { CurrentPageReference } from 'lightning/navigation';

export default class lwc_CarCareNavigationComp extends LightningElement {
    @wire(CurrentPageReference) pageRef;
    @track currentSelection = 1;

    navigateToScreen(event){
        //console.log("event currentTarget   :    "+event.currentTarget.dataset.targetId);
        //console.log("event detail   :    "+event.detail);
        /*const naviageTo = event.currentTarget.dataset.targetId;
        console.log("naviageTo   :    "+naviageTo);
        if(naviageTo === "1"){
            fireEvent(this.pageRef, 'navigationClickedEvent', 1);
        }
        else if(naviageTo === "2"){
            fireEvent(this.pageRef, 'navigationClickedEvent', 2);
        }
        else if(naviageTo === "3"){
            fireEvent(this.pageRef, 'navigationClickedEvent', 3);
        }
        else if(naviageTo === "4"){
            fireEvent(this.pageRef, 'navigationClickedEvent', 4);
        }
        else if(naviageTo === "5"){
            fireEvent(this.pageRef, 'navigationClickedEvent', 5);
        }
        else if(naviageTo === "6"){
            
        }*/
        const targetId = event.currentTarget.dataset.targetId;
        this.currentSelection = parseInt(targetId, 0);
        //console.log("this.currentSelection : "+this.currentSelection);
        //console.log("isNaN(this.currentSelection) : "+isNaN(this.currentSelection));
        //console.log("(this.currentSelection !== undefined && isNaN(this.currentSelection) ) : "+(this.currentSelection !== undefined && isNaN(this.currentSelection) ));
        if(this.currentSelection !== undefined && isNaN(this.currentSelection) === false ){
            fireEvent(this.pageRef, 'navigationClickedEvent', this.currentSelection);
        }
        else{
            //console.log("An error has Occured, please contact you Admin");
        }
    }

    get showFirstPage_Normal() {
        return this.currentSelection !== 1 ? true : false;
    }

    get showFirstPage_Highlighted() {
        return this.currentSelection === 1 ? true : false;
    }

    get showSecondPage_Normal() {
        return this.currentSelection !== 2 ? true : false;
    }

    get showSecondPage_Highlighted() {
        return this.currentSelection === 2 ? true : false;
    }

    get showThirdPage_Normal() {
        return this.currentSelection !== 3 ? true : false;
    }

    get showThirdPage_Highlighted() {
        return this.currentSelection === 3 ? true : false;
    }

    get showFourthPage_Normal() {
        return this.currentSelection !== 4 ? true : false;
    }

    get showFourthPage_Highlighted() {
        return this.currentSelection === 4 ? true : false;
    }

    get showFifthPage_Normal() {
        return this.currentSelection !== 5 ? true : false;
    }

    get showFifthPage_Highlighted() {
        return this.currentSelection === 5 ? true : false;
    }

    get showSixthPage_Normal() {
        return this.currentSelection !== 6 ? true : false;
    }

    get showSixthPage_Highlighted() {
        return this.currentSelection === 6 ? true : false;
    }
}