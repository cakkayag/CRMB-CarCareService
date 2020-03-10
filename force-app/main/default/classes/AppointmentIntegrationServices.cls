public without sharing class AppointmentIntegrationServices {

    private static string exceptionStr = '';
    
    @AuraEnabled(cacheable=true)
    public static List<AppointmentStoreObj.Items> getSelectedAndNearbyStoresList(String branchId){
        Map<Decimal , AppointmentStoreObj.Items> distanceToStoreMap = new Map<Decimal, AppointmentStoreObj.Items>();
        AppointmentStoreObj nearByStoresObj = new AppointmentStoreObj();
        if(String.isNotBlank(branchId)){
            Car_Care_Service_Setting__mdt setting = getCarCareServiceSettings();
            if(setting != null && String.isNotBlank( setting.store_Endpoint__c)){
        
            AppointmentStoreObj.Items selectedStoreInfo = new AppointmentStoreObj.Items();
                
                HTTPResponse res = callAppointmentServiceAPI( setting.store_Endpoint__c, 'GET', '' );
                if(res != null && res.getStatusCode() == 200 ){
                    String jsonBody = res.getBody();
                    nearByStoresObj = AppointmentStoreObj.parseList(jsonBody);
                    if(nearByStoresObj != null && nearByStoresObj.items != null){
                        Map<Integer , AppointmentStoreObj.Items> branchIdToStoreObjMap = new Map<Integer , AppointmentStoreObj.Items>();
                        for(AppointmentStoreObj.Items items : nearByStoresObj.items){
                            if(items.branchId != null && branchId.isNumeric() ){
                                
                                branchIdToStoreObjMap.put(items.branchId , items );
                            }
                        }
                        List<AAA_Location__c> Locations = getNearbyLocation(branchId);
                        for(AAA_Location__c locationObj : Locations){
                            Integer carCareLocationNumber = String.isNotBlank(locationObj.Car_Care_Location_Number__c) &&
                                                            locationObj.Car_Care_Location_Number__c.isNumeric() 
                                                            ? Integer.valueOf(locationObj.Car_Care_Location_Number__c)
                                                            : null;
                            if( carCareLocationNumber != null && branchIdToStoreObjMap.containsKey(carCareLocationNumber)){
                                system.debug(' locationObj    : '+locationObj);
                                AppointmentStoreObj.Items Item = branchIdToStoreObjMap.get(carCareLocationNumber);
                                Item.imageUrl = locationObj.Store_Image_URL__c ;
                                if(Item.branchId !=  Integer.valueOf(branchId) ){
                                    distanceToStoreMap.put((Decimal)locationObj.get('dist') , Item);
                                }else{
                                    distanceToStoreMap.put(0.0 , Item);
                                }
                                
                                
                            }
                        }
                    } 
                    
                }
            }
            
        }
        return distanceToStoreMap != null && distanceToStoreMap.isEmpty() == false ? distanceToStoreMap.values() : new List<AppointmentStoreObj.Items>() ;
    }

    @AuraEnabled(cacheable=true)
    public static AppointmentServiceObj getAllAvailableServices(String storeId){
        AppointmentServiceObj availableServices = new AppointmentServiceObj();
        if(String.isNotBlank(storeId)){
            Car_Care_Service_Setting__mdt setting = getCarCareServiceSettings();
            if(setting != null && String.isNotBlank( setting.service_Endpoint__c)){
                String endPoint = setting.service_Endpoint__c.replace('{StoreId}',  storeId);
                
                HTTPResponse res = callAppointmentServiceAPI(endPoint, 'GET', '' );
                if(res != null && res.getStatusCode() == 200 ){
                    String jsonBody = res.getBody();
                    availableServices = AppointmentServiceObj.parse(jsonBody);
                }
            }
        }
        return availableServices;
    }

    @AuraEnabled(cacheable=true)
    public static ItemsWrap getAllVehicleMakes(){
        ItemsWrap vehicleMake = new ItemsWrap();
        Car_Care_Service_Setting__mdt setting = getCarCareServiceSettings();
            
        if(setting != null && String.isNotBlank( setting.vehicle_Make_EndPoint__c)){
            String endPoint = setting.vehicle_Make_EndPoint__c;
            HTTPResponse res = callAppointmentServiceAPI(endPoint, 'GET', '' );
            if(res != null && res.getStatusCode() == 200 ){
                String jsonBody = res.getBody();
                vehicleMake = (ItemsWrap) System.JSON.deserialize(jsonBody, ItemsWrap.class);
            }
            else{
                vehicleMake.hasException = true;
                vehicleMake.exceptionMessage = 'Callout Failed due to '+ (res != null ? res.getStatus() : exceptionStr);
            }
            
        }
        return vehicleMake;
    }

    @AuraEnabled(cacheable=true)
    public static ItemsWrap getAllVehicleModelsByMakeSelected(String makeSelectedStr, String modelStr){
        ItemsWrap vehicleModel = new ItemsWrap();
        if(String.isNotBlank(makeSelectedStr) ){
            makeSelectedStr =  EncodingUtil.urlEncode(makeSelectedStr, 'UTF-8').replace('+', '%20') ;
            Car_Care_Service_Setting__mdt setting = getCarCareServiceSettings();
            if(setting != null && String.isNotBlank( setting.vehicle_Model_EndPoint__c)){
            
                String endPoint = setting.vehicle_Model_EndPoint__c.replace('{VehicleMake}',  makeSelectedStr).replace('{vehicleModel}',  modelStr);
                HTTPResponse res = callAppointmentServiceAPI(endPoint, 'GET', '' );
                if(res != null && res.getStatusCode() == 200 ){
                    String jsonBody = res.getBody();
                    vehicleModel = (ItemsWrap) System.JSON.deserialize(jsonBody, ItemsWrap.class);
                }
                else{
                    vehicleModel.hasException = true;
                    vehicleModel.exceptionMessage = 'Callout Failed due to '+ (res != null ? res.getStatus() : exceptionStr);
                }
                
            }    
        }
        return vehicleModel;
    }

    

    @AuraEnabled(cacheable=true)
    public static ItemsWrap getYears(){
        ItemsWrap years = new ItemsWrap();
        Car_Care_Service_Setting__mdt setting = getCarCareServiceSettings();
        if(setting != null && String.isNotBlank( setting.years_EndPoint__c)){
        
           HTTPResponse res = callAppointmentServiceAPI(setting.years_EndPoint__c, 'GET', '' );
            if(res != null && res.getStatusCode() == 200 ){
                String jsonBody = res.getBody();
                years = (ItemsWrap) System.JSON.deserialize(jsonBody, ItemsWrap.class);
            }
            else{
                years.hasException = true;
                years.exceptionMessage = 'Callout Failed due to '+ (res != null ? res.getStatus() : exceptionStr);
            }
        }
        return years;
    }

    @AuraEnabled(cacheable=true)
    public static AppointmentObj getAvailableAppointments(String storeId){
        AppointmentObj availableAppointment = new AppointmentObj();
        Car_Care_Service_Setting__mdt setting = getCarCareServiceSettings();
        if(setting != null && String.isNotBlank( setting.Appointment_Endpoint__c)){
            String businessHoursJSON = getBusinessHoursJSON(setting.Business_Hours_Name__c);
            List<Date> holidays = getHolidaysList();
            System.debug('--businessHoursJSON--'+businessHoursJSON);
            Integer configuredWeeks = setting.Consideration_Weeks__c != null && setting.Consideration_Weeks__c > 0 ? 
                                        Integer.valueof(setting.Consideration_Weeks__c) : CarCareServiceConstants.defaultWeeks;
            availableAppointment.paginationForMobile =  setting.pagination_for_Mobile__c != null && setting.pagination_for_Mobile__c > 0 ? 
                                        Integer.valueof(setting.pagination_for_Mobile__c) : CarCareServiceConstants.default_pagination_for_Mobile;
            availableAppointment.paginationForLaptop = setting.pagination_for_Laptop__c != null && setting.pagination_for_Laptop__c > 0 ? 
                                        Integer.valueof(setting.pagination_for_Laptop__c) : CarCareServiceConstants.default_pagination_for_Laptop;
            availableAppointment.paginationForTablet = setting.pagination_for_Tablet__c != null && setting.pagination_for_Tablet__c > 0 ? 
                                        Integer.valueof(setting.pagination_for_Tablet__c) : CarCareServiceConstants.default_pagination_for_Tablet;

            String endPoint = setting.Appointment_Endpoint__c.replace('{StoreId}',  storeId).replace('{Weeks}', String.valueOf(configuredWeeks));
            System.debug('endPoint : '+endPoint);
            HTTPResponse res = callAppointmentServiceAPI( endPoint, 'GET', '' );
            if(res != null && res.getStatusCode() == 200 ){
                String jsonBody = res.getBody();
                availableAppointment.days = AppointmentObj.parse(jsonBody);
            }
            else{
                //String jsonBody =  '{"days":[{"date":"1/21/2020 12:00:00 AM","openTime":"07:30:00","closeTime":"18:00:00","availableTimes":["07:30:00","08:30:00","09:00:00","10:00:00","10:30:00","11:00:00","11:30:00","12:00:00","12:30:00","13:00:00","13:30:00","14:00:00","14:30:00","15:00:00","15:30:00","16:00:00","16:30:00"]},{"date":"1/22/2020 12:00:00 AM","openTime":"07:30:00","closeTime":"18:00:00","availableTimes":["07:30:00","08:00:00","08:30:00","09:00:00","09:30:00","10:00:00","10:30:00","11:00:00","11:30:00","12:00:00","12:30:00","13:00:00","13:30:00","14:00:00","14:30:00","15:00:00","15:30:00","16:00:00","16:30:00"]},{"date":"1/23/2020 12:00:00 AM","openTime":"07:30:00","closeTime":"18:00:00","availableTimes":["07:30:00","08:00:00","08:30:00","09:00:00","09:30:00","10:00:00","10:30:00","11:00:00","11:30:00","12:00:00","12:30:00","13:00:00","13:30:00","14:00:00","14:30:00","15:00:00","15:30:00","16:00:00","16:30:00"]},{"date":"1/24/2020 12:00:00 AM","openTime":"07:30:00","closeTime":"18:00:00","availableTimes":["07:30:00","08:00:00","08:30:00","09:00:00","09:30:00","10:00:00","10:30:00","11:00:00","11:30:00","12:00:00","12:30:00","13:00:00","13:30:00","14:00:00","14:30:00","15:00:00","15:30:00","16:00:00","16:30:00"]},{"date":"1/25/2020 12:00:00 AM","openTime":"08:00:00","closeTime":"16:00:00","availableTimes":["08:00:00","08:30:00","09:00:00","09:30:00","10:00:00","10:30:00","11:00:00","11:30:00","12:00:00","12:30:00","13:00:00","13:30:00","14:00:00","14:30:00"]},{"date":"1/27/2020 12:00:00 AM","openTime":"07:30:00","closeTime":"18:00:00","availableTimes":["07:30:00","08:00:00","08:30:00","09:00:00","09:30:00","10:00:00","10:30:00","11:00:00","11:30:00","12:00:00","12:30:00","13:00:00","13:30:00","14:00:00","14:30:00","15:00:00","15:30:00","16:00:00","16:30:00"]},{"date":"1/28/2020 12:00:00 AM","openTime":"07:30:00","closeTime":"18:00:00","availableTimes":["07:30:00","08:00:00","08:30:00","09:00:00","10:00:00","10:30:00","11:00:00","11:30:00","12:00:00","12:30:00","13:00:00","13:30:00","14:00:00","14:30:00","15:00:00","15:30:00","16:00:00","16:30:00"]},{"date":"1/29/2020 12:00:00 AM","openTime":"07:30:00","closeTime":"18:00:00","availableTimes":["07:30:00","08:00:00","08:30:00","09:00:00","10:00:00","10:30:00","11:00:00","11:30:00","12:00:00","12:30:00","13:00:00","13:30:00","14:00:00","14:30:00","15:00:00","15:30:00","16:00:00","16:30:00"]},{"date":"1/30/2020 12:00:00 AM","openTime":"07:30:00","closeTime":"18:00:00","availableTimes":["07:30:00","08:00:00","08:30:00","09:00:00","10:00:00","10:30:00","11:00:00","11:30:00","12:00:00","12:30:00","13:00:00","13:30:00","14:00:00","14:30:00","15:00:00","15:30:00","16:00:00","16:30:00"]},{"date":"1/31/2020 12:00:00 AM","openTime":"07:30:00","closeTime":"18:00:00","availableTimes":["07:30:00","08:00:00","08:30:00","09:00:00","11:00:00","11:30:00","12:00:00","12:30:00","13:00:00","13:30:00","14:00:00","14:30:00","15:00:00","15:30:00","16:00:00","16:30:00"]}]}';
                //availableAppointment.days = AppointmentObj.parse(jsonBody);
                availableAppointment.hasException = true;
                availableAppointment.exceptionMessage = 'Callout Failed due to '+ (res != null ? 'Status code : '+res.getStatusCode() +' and Status :'+res.getStatus() : exceptionStr);
            }
            availableAppointment.businessHoursJSON = businessHoursJSON;
            availableAppointment.holidays = holidays;
        }
        return availableAppointment;
    }

    @AuraEnabled
    public static AppointmentConfirmationServiceObj reserveAppointment(String payLoad){
        AppointmentConfirmationServiceObj confirmRes = new AppointmentConfirmationServiceObj();
        System.debug('confirmRes : '+confirmRes);

        /*
        Date Appointmentdate = String.isNotBlank(confirmRes.appointmentDateVal)  
                                ? Date.valueOf(confirmRes.appointmentDateVal)
                                : null ;
        
        String time = String.isNotBlank(confirmRes.appointmentTimeVal)  
                        ? confirmRes.appointmentTimeVal.split(' ')
                        : null ;
        */

        Car_Care_Service_Setting__mdt setting = getCarCareServiceSettings();
        if(String.isNotBlank(payLoad) && setting != null && String.isNotBlank( setting.Confirmation_Endpoint__c)){
            
            String endPoint = setting.Confirmation_Endpoint__c;
            System.debug('endPoint : '+endPoint);
            HTTPResponse res = callAppointmentServiceAPI( endPoint, 'POST', payLoad );
            if(res != null && res.getStatusCode() == 201 ){
                String jsonBody = res.getBody();
                System.debug('jsonBody : '+jsonBody);
                confirmRes = AppointmentConfirmationServiceObj.parse(jsonBody);
                //save a record in appointment Object
                createAppointmentRecord(payLoad);
            }
            else{
                System.debug('res.getStatusCode()  : '+res.getStatusCode());
                confirmRes.hasException = true;
                confirmRes.exceptionMessage = 'Callout Failed due to '+ (res != null ? 'Status code : '+res.getStatusCode() +' and Status :'+res.getStatus() : exceptionStr);
            }
            
        }
        return confirmRes;
    }

    private Static HTTPResponse callAppointmentServiceAPI(String endPoint, String httpMethod, String payload ){
        HTTPResponse res = null;
        Car_Care_Service_Setting__mdt setting = getCarCareServiceSettings();
        if(setting != null && String.isNotBlank( setting.Authorization_Key__c)){
        
            HttpRequest req = new HttpRequest();
            req.setEndpoint(endPoint);
            req.setMethod(httpMethod);
            req.setHeader('Content-Type','application/json'); 
            req.setHeader('Authorization', setting.Authorization_Key__c);
            if(httpMethod == 'POST'){
                req.setBody(payload);
            }
            
            // Create a new http object to send the request object
            // A response object is generated as a result of the request  

            Http http = new Http();
            
            try{
                system.debug('Started : '+System.now());
                res = http.send(req);
                system.debug('Ended : '+System.now());
            }
            catch(exception e){
                exceptionStr = e.getMessage();
                System.debug('## Exception : '+e.getMessage());
            }
        }
        return res;
    }

    private static List<AAA_Location__c> getNearbyLocation(String branchId){
        List<AAA_Location__c> Locations = new List<AAA_Location__c >();
        Car_Care_Service_Setting__mdt setting = getCarCareServiceSettings();
        if(setting != null ){
            Integer nearByRange = setting.Consideration_Range__c != null ? 
                                    Integer.valueOf(setting.Consideration_Range__c) : CarCareServiceConstants.defaultRange;
            // To fetch lat long values of selected store
            AAA_Location__c selectedLoc = [select name,Car_Care_Location_Number__c, Store_Image_URL__c, Geocode__Latitude__s,Geocode__Longitude__s from AAA_Location__c where Car_Care_Location_Number__c =: branchId and Car_Care__c = true limit 1] ;
            Decimal latitude = selectedLoc.Geocode__Latitude__s;  // This will be our selected store lat value
            Decimal longitude = selectedLoc.Geocode__Longitude__s; // This will be our selected store long value

            
            //To get nearby locations within 10 miles…
            Locations = new List<AAA_Location__c >([SELECT Car_Care_Location_Number__c ,
                                                        Store_Image_URL__c,
                                                        Geocode__Latitude__s, 
                                                        Geocode__Longitude__s,
                                                        DISTANCE(Geocode__c, GEOLOCATION(:latitude,:longitude), 'mi') dist
                                                        FROM AAA_Location__c
                                                        where (DISTANCE(Geocode__c, GEOLOCATION(:latitude,:longitude), 'mi') > 0 
                                                        and DISTANCE(Geocode__c, GEOLOCATION(:latitude,:longitude), 'mi') <: nearByRange ) 
                                                        and Car_Care__c = true
                                                        ORDER BY
                                                        DISTANCE( Geocode__c, GEOLOCATION( :latitude, :longitude ), 'mi' )   
                                                        ]);
            
            Locations.add(selectedLoc);
            }
        return Locations;
    }
    
     
    private static Car_Care_Service_Setting__mdt getCarCareServiceSettings(){
        Car_Care_Service_Setting__mdt carCareServiceSetting = new Car_Care_Service_Setting__mdt();
        for( Car_Care_Service_Setting__mdt Setting : [Select id, 
                                                            DeveloperName, 
                                                            Appointment_Endpoint__c,
                                                            Authorization_Key__c,
                                                            Consideration_Range__c,
                                                            Consideration_Weeks__c,
                                                            pagination_for_Laptop__c,
                                                            pagination_for_Mobile__c,
                                                            pagination_for_Tablet__c,
                                                            service_Endpoint__c,
                                                            store_Endpoint__c,
                                                            vehicle_Make_EndPoint__c,
                                                            vehicle_Model_EndPoint__c,
                                                            years_EndPoint__c,
                                                            Business_Hours_Name__c ,
                                                            Confirmation_Endpoint__c
                                                            from Car_Care_Service_Setting__mdt 
                                                            where DeveloperName =: CarCareServiceConstants.Car_Care_Service_Setting]){
            
            carCareServiceSetting = Setting;
            break;
        }
        return carCareServiceSetting;
    }

    private static String getBusinessHoursJSON(String businessHoursName) {
        String bhoursJSON = '';
        List<BusinessHours> bList = [SELECT Id, Name, MondayStartTime, MondayEndTime, 
                                        TuesdayStartTime, TuesdayEndTime, 
                                        WednesdayStartTime, WednesdayEndTime, 
                                        ThursdayStartTime, ThursdayEndTime,  
                                        FridayStartTime, FridayEndTime, 
                                        SaturdayStartTime, SaturdayEndTime 
                                        FROM BusinessHours where name =: businessHoursName];
        if(bList != null && bList.size() > 0) {
            BusinessHours bhours = bList[0];
            String mondayStartTime = '"'+((bhours.MondayStartTime.hour() > 12) ? bhours.MondayStartTime.hour() - 12 : bhours.MondayStartTime.hour()) 
                                        + ':' + bhours.MondayStartTime.minute() + ' ' 
                                        + ((bhours.MondayStartTime.hour() > 12) ? 'P.M.' : 'A.M.') + '"';
            String mondayEndTime = '"'+((bhours.MondayEndTime.hour() > 12) ? bhours.MondayEndTime.hour() - 12 : bhours.MondayEndTime.hour()) 
                                        + ':' + bhours.MondayEndTime.minute() + ' ' 
                                        + ((bhours.MondayEndTime.hour() > 12) ? 'P.M.' : 'A.M.') + '"';
            String tuesdayStartTime = '"'+((bhours.TuesdayStartTime.hour() > 12) ? bhours.TuesdayStartTime.hour() - 12 : bhours.TuesdayStartTime.hour()) 
                                        + ':' + bhours.TuesdayStartTime.minute() + ' ' 
                                        + ((bhours.TuesdayStartTime.hour() > 12) ? 'P.M.' : 'A.M.') + '"';
            String tuesdayEndTime = '"'+((bhours.TuesdayEndTime.hour() > 12) ? bhours.TuesdayEndTime.hour() - 12 : bhours.TuesdayEndTime.hour()) 
                                        + ':' + bhours.TuesdayEndTime.minute() + ' ' 
                                        + ((bhours.TuesdayEndTime.hour() > 12) ? 'P.M.' : 'A.M.') + '"';
            String wednesdayStartTime = '"'+((bhours.WednesdayStartTime.hour() > 12) ? bhours.WednesdayStartTime.hour() - 12 : bhours.WednesdayStartTime.hour()) 
                                        + ':' + bhours.WednesdayStartTime.minute() + ' ' 
                                        + ((bhours.WednesdayStartTime.hour() > 12) ? 'P.M.' : 'A.M.') + '"';
            String wednesdayEndTime = '"'+((bhours.WednesdayEndTime.hour() > 12) ? bhours.WednesdayEndTime.hour() - 12 : bhours.WednesdayEndTime.hour()) 
                                        + ':' + bhours.WednesdayEndTime.minute() + ' ' 
                                        + ((bhours.WednesdayEndTime.hour() > 12) ? 'P.M.' : 'A.M.') + '"';
            String thursdayStartTime = '"'+((bhours.ThursdayStartTime.hour() > 12) ? bhours.ThursdayStartTime.hour() - 12 : bhours.ThursdayStartTime.hour()) 
                                        + ':' + bhours.ThursdayStartTime.minute() + ' ' 
                                        + ((bhours.ThursdayStartTime.hour() > 12) ? 'P.M.' : 'A.M.') + '"';
            String thursdayEndTime = '"'+((bhours.ThursdayEndTime.hour() > 12) ? bhours.ThursdayEndTime.hour() - 12 : bhours.ThursdayEndTime.hour()) 
                                        + ':' + bhours.ThursdayEndTime.minute() + ' ' 
                                        + ((bhours.ThursdayEndTime.hour() > 12) ? 'P.M.' : 'A.M.') + '"';
            String fridayStartTime = '"'+((bhours.FridayStartTime.hour() > 12) ? bhours.FridayStartTime.hour() - 12 : bhours.FridayStartTime.hour()) 
                                        + ':' + bhours.FridayStartTime.minute() + ' ' 
                                        + ((bhours.FridayStartTime.hour() > 12) ? 'P.M.' : 'A.M.') + '"';
            String fridayEndTime = '"'+((bhours.FridayEndTime.hour() > 12) ? bhours.FridayEndTime.hour() - 12 : bhours.FridayEndTime.hour()) 
                                        + ':' + bhours.FridayEndTime.minute() + ' ' 
                                        + ((bhours.FridayEndTime.hour() > 12) ? 'P.M.' : 'A.M.') + '"';
            String saturdayStartTime = '"'+((bhours.SaturdayStartTime.hour() > 12) ? bhours.SaturdayStartTime.hour() - 12 : bhours.SaturdayStartTime.hour()) 
                                        + ':' + bhours.SaturdayStartTime.minute() + ' ' 
                                        + ((bhours.SaturdayStartTime.hour() > 12) ? 'P.M.' : 'A.M.') + '"';
            String saturdayEndTime = '"'+((bhours.SaturdayEndTime.hour() > 12) ? bhours.SaturdayEndTime.hour() - 12 : bhours.SaturdayEndTime.hour()) 
                                        + ':' + bhours.SaturdayEndTime.minute() + ' ' 
                                        + ((bhours.SaturdayEndTime.hour() > 12) ? 'P.M.' : 'A.M.') + '"';
            
            bhoursJSON = '{'+ '"mondayStartTime" :' + mondayStartTime + ',' 
                            + '"mondayEndTime" :' + mondayEndTime + ',' 
                            + '"tuesdayStartTime" :' + tuesdayStartTime + ',' 
                            + '"tuesdayEndTime" :' + tuesdayEndTime + ',' 
                            + '"wednesdayStartTime" :' + wednesdayStartTime + ',' 
                            + '"wednesdayEndTime" :' + wednesdayEndTime + ',' 
                            + '"thursdayStartTime" :' + thursdayStartTime + ',' 
                            + '"thursdayEndTime" :' + thursdayEndTime + ',' 
                            + '"fridayStartTime" :' + fridayStartTime + ',' 
                            + '"fridayEndTime" :' + fridayEndTime + ',' 
                            + '"saturdayStartTime" :' + saturdayStartTime + ',' 
                            + '"saturdayEndTime" :' + saturdayEndTime 
                            + '}';
        }
        return bhoursJSON;
    }

    private static List<Date> getHolidaysList() {
        List<Holiday> holidayList = [SELECT Id, Name, ActivityDate FROM Holiday WHERE ActivityDate = THIS_YEAR];
        List<Date> holidays = new List<Date>();
        if(holidayList != null && holidayList.size() > 0) {
            for(Holiday h: holidayList) {
                holidays.add(h.ActivityDate);
            }
        }
        return holidays;
    }

    private static String createAppointmentRecord(String payLoad) {
        try {
            System.debug('--payLoad--'+payLoad);
            ApptObjFromPayload apptObj = (ApptObjFromPayload) System.JSON.deserialize(payLoad, ApptObjFromPayload.class);
            System.debug('--apptObj--'+apptObj);
            Appointment__c appt = new Appointment__c();
            appt.Date_Time__c = (DateTime) JSON.deserialize(JSON.serialize(apptObj.appointmentTime), DateTime.class);
            appt.Email__c = apptObj.customerEmail;
            appt.First_Name__c = apptObj.customerFirstName;
            appt.Last_Name__c = apptObj.customerLastName;
            appt.Make__c = apptObj.vehicleMake;
            appt.Mileage__c = apptObj.vehicleMileage;
            appt.Mobile__c = apptObj.customerPhone;
            appt.Model__c = apptObj.vehicleModel;
            appt.Service__c = apptObj.serviceDescription;
            appt.Store_Number__c = String.valueOf(apptObj.storeId);
            appt.Year__c = apptObj.vehicleYear;
            appt.RecordTypeId = Schema.SObjectType.Appointment__c.getRecordTypeInfosByDeveloperName().get('Car_Care').getRecordTypeId();
            insert appt;
        } catch(Exception ex) {
            system.debug('--Exception--'+ex.getMessage());
        }
        return '';
    }

    public class ItemsWrap{
        @AuraEnabled public List<string> items;
        @AuraEnabled public boolean hasException;
        @AuraEnabled public String exceptionMessage;

        public ItemsWrap(){
            items = new List<string>(); 
            hasException = false;
            exceptionMessage = '';   
        }
    }

    class ApptObjFromPayload {
        public Integer storeId;
        public String customerFirstName;
        public String customerLastName;
        public String customerEmail;
        public String customerPhone;
        public String vehicleMake;
        public String vehicleModel;
        public String vehicleYear;
        public String vehicleMileage;
        public String appointmentTime;
        public String storeResource;
        public String storeResourceDescription;
        public boolean stayingWithVehicle;
        public boolean customerWantsPromos;
        public boolean customerWantsSmsReminders;
        public boolean customerNeedsTransportation;
        public String serviceDescription;
    }
}