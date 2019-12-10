import { LightningElement, track } from 'lwc';

export default class lwc_CarCareServiceVehicleInfoComp extends LightningElement {
    @track selectedYear;
    @track selectedMake;
    @track selectedModel;

    get yearOptions() {
        return [
            { label: 'New', value: 'new' },
            { label: 'In Progress', value: 'inProgress' },
            { label: 'Finished', value: 'finished' },
        ];
    }

    get makeOptions() {
        return [
            { label: 'New', value: 'new' },
            { label: 'In Progress', value: 'inProgress' },
            { label: 'Finished', value: 'finished' },
        ];
    }

    get modelOptions() {
        return [
            { label: 'New', value: 'new' },
            { label: 'In Progress', value: 'inProgress' },
            { label: 'Finished', value: 'finished' },
        ];
    }

    handleYearChange(event) {
        this.selectedYear = event.detail.value;
    }

    handleMakeChange(event) {
        this.selectedMake = event.detail.value;
    }

    handleModelChange(event) {
        this.selectedModel = event.detail.value;
    }
}