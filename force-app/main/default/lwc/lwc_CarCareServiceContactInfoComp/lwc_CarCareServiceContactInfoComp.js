import { LightningElement, api, track } from 'lwc';

//import css from static resource
import carCareResources from '@salesforce/resourceUrl/CarCareReserveService';
import { loadStyle } from 'lightning/platformResourceLoader';

export default class lwc_CarCareServiceContactInfoComp extends LightningElement {
    
    //baseURL = 'https://github.com/trailheadapps/lwc-recipes/tree/master/force-app/main/default/';

    @api source;
    @api contactRec = {};

    //@api showFirstName = false;
    //@api showLastName = false;
    //@api showEmail = false;
    //@api showMobile = false;

    @track firstNameVar;
    @track lastNameVar;
    @track emailVar;
    @track mobileVar;
    //@track contactDetails = new this.contact('' , '' , '' , '');

    hasRendered = false;

    /*get sourceURL() {
        return this.baseURL + this.source;
    }*/

    renderedCallback() {
        if(!this.hasRendered){
            //console.log('   this.hasRendered '+this.hasRendered);
            this.contactRec = JSON.parse(JSON.stringify(this.contactRec))
            //console.log('   this.contactRec');
            //console.log(this.contactRec);
            //console.log('this.contactRec !== {} '+(this.contactRec !== {}));
            if(this.contactRec !== undefined && this.contactRec !== {}){
                
                this.contactRecord(this.contactRec);
            }
            
            Promise.all([
                //loadScript(this, D3 + '/d3.v5.min.js'),
                loadStyle(this, carCareResources + '/css/reserveService.css'),
            ])
            .then(() => {
                
            })
            .catch(error => {
                // eslint-disable-next-line no-console
                console.log('--error--'+error);
            });
            
        }
        else{
            this.hasRendered = true;
        }

        
        
    }
    
    /*handleOnChange(event){
        console.log("event.target.name : "+event.target.name);
        console.log("event.target.value : "+event.target.value);
        this[event.target.name] = event.target.value
        console.log(" handleOnChange this.firstNameVar "+this.firstNameVar);
        //this.getContactInfo();
    }
    
    contact (fName , lName , email, mobile){
        this.firstName = fName ;
        this.lastName = lName;
        this.email = email;
        this.mobile = mobile;
    }*/
    
    @api
    getContactInfo(){
        const inputComponents = this.template.querySelectorAll('lightning-input');
        inputComponents.forEach(element => {
            this[element.name] = element.value
        });
        
        let contact = {
            firstName : this.firstNameVar ,
            lastName : this.lastNameVar,
            email : this.emailVar,
            mobile : this.mobileVar
        }; 
        
        //console.log(" getContactInfo : ");
        //console.log(contact);
        //new this.contact(this.firstNameVar , this.lastNameVar ,this.emailVar , this.mobileVar);
        return contact; 
        
    }

    contactRecord(Obj) {
        this.firstNameVar = Obj.firstName !== undefined ? Obj.firstName : '';
        this.lastNameVar = Obj.lastName!== undefined ? Obj.lastName : '';
        this.emailVar = Obj.email!== undefined ? Obj.email : '';
        this.mobileVar = Obj.mobile !== undefined ? Obj.mobile : '';
        //console.log(' contactRecord : this.mobileVar : '+this.mobileVar);
    }

    @api
    ValidateContactInfo(evt){
        const allValid = [...this.template.querySelectorAll('lightning-input')]
            .reduce((validSoFar, inputCmp) => {
                        inputCmp.reportValidity();
                        return validSoFar && inputCmp.checkValidity();
            }, true);
        if (allValid) {
            //continue;
        } else {
            //stop;
            evt.preventDefault();
            evt.stopPropagation();
        }
        return allValid;
    }

}