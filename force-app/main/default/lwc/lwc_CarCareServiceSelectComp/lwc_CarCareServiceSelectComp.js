import { LightningElement } from 'lwc';

export default class lwc_CarCareServiceSelectComp extends LightningElement {
    get services() {
        return [
            'Oil Change',
            'Tires',
            'Brakes',
            'Alignment',
            'Battery & Electrical',
            'Engine Diagnostic',
            'NC State Inspection',
            'A/C System'
        ];
    }
}