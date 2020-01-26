public without sharing class AppointmentIntegrationServices {

    private static string exceptionStr = '';
    //private static map<String, Car_Care_Service_Setting__mdt> settingsMap = new map<String, Car_Care_Service_Setting__mdt>(); 

    

    @AuraEnabled(cacheable=true)
    public static List<AppointmentStoreObj.Items> getSelectedAndNearbyStoresList(String branchId){
        Map<Decimal , AppointmentStoreObj.Items> distanceToStoreMap = new Map<Decimal, AppointmentStoreObj.Items>();
        AppointmentStoreObj nearByStoresObj = new AppointmentStoreObj();
        if(String.isNotBlank(branchId)){
            Car_Care_Service_Setting__mdt setting = getCarCareServiceSettings();
            if(setting != null && String.isNotBlank( setting.store_Endpoint__c)){
        
            AppointmentStoreObj.Items selectedStoreInfo = new AppointmentStoreObj.Items();
                
                HTTPResponse res = callAppointmentServiceAPI( setting.store_Endpoint__c );
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
                
                HTTPResponse res = callAppointmentServiceAPI(endPoint );
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
            HTTPResponse res = callAppointmentServiceAPI(endPoint );
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
                HTTPResponse res = callAppointmentServiceAPI(endPoint );
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
        
           HTTPResponse res = callAppointmentServiceAPI(setting.years_EndPoint__c );
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
            Integer configuredWeeks = setting.Consideration_Weeks__c != null && setting.Consideration_Weeks__c > 0 ? 
                                        Integer.valueof(setting.Consideration_Weeks__c) : CarCareServiceConstants.defaultWeeks;
            String endPoint = setting.Appointment_Endpoint__c.replace('{StoreId}',  storeId).replace('{Weeks}', String.valueOf(configuredWeeks));
           HTTPResponse res = callAppointmentServiceAPI( endPoint );
            if(res != null && res.getStatusCode() == 200 ){
                String jsonBody = res.getBody();
                availableAppointment = (AppointmentObj) System.JSON.deserialize(jsonBody, AppointmentObj.class);
            }
            else{
                availableAppointment.hasException = true;
                availableAppointment.exceptionMessage = 'Callout Failed due to '+ (res != null ? 'Status code : '+res.getStatusCode() +' and Status :'+res.getStatus() : exceptionStr);
            }
        }
        return availableAppointment;
    }

    private static HTTPResponse callAppointmentServiceAPI(String endPoint ){
        HTTPResponse res = null;
        Car_Care_Service_Setting__mdt setting = getCarCareServiceSettings();
        if(setting != null && String.isNotBlank( setting.Authorization_Key__c)){
        
            HttpRequest req = new HttpRequest();
            req.setEndpoint(endPoint);
            req.setMethod('GET');
            req.setHeader('Content-Type','application/json'); 
            req.setHeader('Authorization', setting.Authorization_Key__c);

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
    
    //Query Against Custom Metadata doesn't consider for 100 SOQL Governer limits, 
    private static Car_Care_Service_Setting__mdt getCarCareServiceSettings(){
        Car_Care_Service_Setting__mdt carCareServiceSetting = new Car_Care_Service_Setting__mdt();
        for( Car_Care_Service_Setting__mdt Setting : [Select id, 
                                                            DeveloperName, 
                                                            Setting_Value__c 
                                                            from Car_Care_Service_Setting__mdt 
                                                            where DeveloperName =: 'Car_Care_Service_Setting']){
            
            carCareServiceSetting = Setting;
            break;
        }
        return carCareServiceSetting;
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
}