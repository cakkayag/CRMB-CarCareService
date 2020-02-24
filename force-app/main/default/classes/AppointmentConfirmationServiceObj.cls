public with sharing class AppointmentConfirmationServiceObj {

    @AuraEnabled public String storeId;
    @AuraEnabled public String customerFirstName;
    @AuraEnabled public String customerLastName;
    @AuraEnabled public String customerEmail;
    @AuraEnabled public String customerPhone;
    @AuraEnabled public String vehicleMake;
    @AuraEnabled public String vehicleModel;
    @AuraEnabled public String vehicleYear;
    @AuraEnabled public String vehicleMileage;
    @AuraEnabled public String appointmentTime;
    @AuraEnabled public String storeResource;
    @AuraEnabled public String storeResourceDescription;
    @AuraEnabled public Boolean stayingWithVehicle;
    @AuraEnabled public Boolean customerWantsPromos;
    @AuraEnabled public Boolean customerWantsSmsReminders;
    @AuraEnabled public Boolean customerNeedsTransportation;
    @AuraEnabled public String serviceDescription;
    


    public AppointmentConfirmationServiceObj() {

    }
}