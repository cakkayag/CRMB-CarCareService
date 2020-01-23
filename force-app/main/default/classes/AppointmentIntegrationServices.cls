public without sharing class AppointmentIntegrationServices {

    private static string exceptionStr = '';
    private static map<String, Car_Care_Service_Setting__mdt> settingsMap = new map<String, Car_Care_Service_Setting__mdt>(); 

    private static List<AAA_Location__c> getNearbyLocation(String branchId){
        List<AAA_Location__c> Locations = new List<AAA_Location__c >();
        Car_Care_Service_Setting__mdt setting = getCarCareServiceSettings(CarCareServiceConstants.Near_By_Range);
        if(setting != null && String.isNotBlank( setting.Setting_Value__c)){
            Integer nearByRange = Integer.valueOf(setting.Setting_Value__c);
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

    @AuraEnabled(cacheable=true)
    public static List<AppointmentStoreObj.Items> getSelectedAndNearbyStoresList(String branchId){
        Map<Decimal , AppointmentStoreObj.Items> distanceToStoreMap = new Map<Decimal, AppointmentStoreObj.Items>();
        AppointmentStoreObj nearByStoresObj = new AppointmentStoreObj();
        if(String.isNotBlank(branchId)){
            Car_Care_Service_Setting__mdt setting = getCarCareServiceSettings(CarCareServiceConstants.Store_End_Point);
            if(setting != null && String.isNotBlank( setting.Setting_Value__c)){
        
            AppointmentStoreObj.Items selectedStoreInfo = new AppointmentStoreObj.Items();
                
                HTTPResponse res = callAppointmentServiceAPI( setting.Setting_Value__c );
                if(res != null && res.getStatusCode() == 200 ){
                    String jsonBody = res.getBody();
                    //system.debug(' getNearByStoreList : jsonBody : '+jsonBody);
                    nearByStoresObj = AppointmentStoreObj.parseList(jsonBody);
                    if(nearByStoresObj != null && nearByStoresObj.items != null){
                        Map<Integer , AppointmentStoreObj.Items> branchIdToStoreObjMap = new Map<Integer , AppointmentStoreObj.Items>();
                        for(AppointmentStoreObj.Items items : nearByStoresObj.items){
                            //system.debug(' items   : '+items);
                            //system.debug(' items.branchId   : '+items.branchId);
                            //system.debug(' branchId.isNumeric()   : '+branchId.isNumeric());
                            if(items.branchId != null && branchId.isNumeric() ){
                                
                                branchIdToStoreObjMap.put(items.branchId , items );
                                //system.debug(' branchIdToStoreObjMap   : '+branchIdToStoreObjMap);
                                /*if(items.branchId ==  Integer.valueOf(branchId) ){
                                    distanceToStoreMap.put(0.0 , items);
                                }*/
                            }
                        }
                        //system.debug(' distanceToStoreMap 1st   : '+distanceToStoreMap);
                        List<AAA_Location__c> Locations = getNearbyLocation(branchId);
                        //system.debug(' Locations    : '+Locations);
                        for(AAA_Location__c locationObj : Locations){
                            Integer carCareLocationNumber = String.isNotBlank(locationObj.Car_Care_Location_Number__c) &&
                                                            locationObj.Car_Care_Location_Number__c.isNumeric() 
                                                            ? Integer.valueOf(locationObj.Car_Care_Location_Number__c)
                                                            : null;
                            //system.debug(' carCareLocationNumber    : '+carCareLocationNumber);
                            //system.debug(' branchIdToStoreObjMap.containsKey(carCareLocationNumber)   : '+branchIdToStoreObjMap.containsKey(carCareLocationNumber));
                            //system.debug(' branchIdToStoreObjMap.get(carCareLocationNumber)    : '+branchIdToStoreObjMap.get(carCareLocationNumber));
                            //system.debug(' (Decimal)locationObj.get(\'dist\')    : '+locationObj.get('dist') );
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
                else{
                    //availableServices.hasException = true;
                    //availableServices.exceptionMessage = 'Callout Failed due to '+ (res != null ? res.getStatus() : exceptionStr);
                }
            }
            
        }
        system.debug(' before Return : '+distanceToStoreMap.values());
        return distanceToStoreMap != null && distanceToStoreMap.isEmpty() == false ? distanceToStoreMap.values() : new List<AppointmentStoreObj.Items>() ;
    }

    @AuraEnabled(cacheable=true)
    public static AppointmentServiceObj getAllAvailableServices(String storeId){
        AppointmentServiceObj availableServices = new AppointmentServiceObj();
        if(String.isNotBlank(storeId)){
            Car_Care_Service_Setting__mdt setting = getCarCareServiceSettings(CarCareServiceConstants.Service_End_Point);
            if(setting != null && String.isNotBlank( setting.Setting_Value__c)){
                String endPoint = setting.Setting_Value__c.replace('{StoreId}',  storeId);
                //String jsonBody = callAppointmentServiceAPI(endPoint );
                //system.debug(' ## availableServices.items : '+jsonBody);
                
                HTTPResponse res = callAppointmentServiceAPI(endPoint );
                if(res != null && res.getStatusCode() == 200 ){
                    String jsonBody = res.getBody();
                    availableServices = AppointmentServiceObj.parse(jsonBody);
                }
                else{
                    //availableServices.hasException = true;
                    //availableServices.exceptionMessage = 'Callout Failed due to '+ (res != null ? res.getStatus() : exceptionStr);
                }
            }
        }
        system.debug(' before Return : '+availableServices.items);
        return availableServices;
    }

    @AuraEnabled(cacheable=true)
    public static ItemsWrap getAllVehicleMakes(){
        ItemsWrap vehicleMake = new ItemsWrap();
        Car_Care_Service_Setting__mdt setting = getCarCareServiceSettings(CarCareServiceConstants.Vehicle_Make_End_Point);
            
        if(setting != null && String.isNotBlank( setting.Setting_Value__c)){
            String endPoint = setting.Setting_Value__c;
            HTTPResponse res = callAppointmentServiceAPI(endPoint );
            system.debug(' ## res.getStatusCode() : '+res.getStatusCode());
            if(res != null && res.getStatusCode() == 200 ){
                String jsonBody = res.getBody();
                system.debug(' ## vehicleMakeList : '+jsonBody);
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
            Car_Care_Service_Setting__mdt setting = getCarCareServiceSettings(CarCareServiceConstants.Vehicle_Model_End_Point);
            if(setting != null && String.isNotBlank( setting.Setting_Value__c)){
            
                String endPoint = setting.Setting_Value__c.replace('{VehicleMake}',  makeSelectedStr).replace('{vehicleModel}',  modelStr);
                //String jsonBody = callAppointmentServiceAPI(endPoint );
                //system.debug(' ## vehicleModelList : '+jsonBody);
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
        //system.debug(' before Return vehicleModelList : '+vehicleModel);
        return vehicleModel;
    }

    

    @AuraEnabled(cacheable=true)
    public static ItemsWrap getYears(){
        ItemsWrap years = new ItemsWrap();
        //String endPoint = getYearsEndPoint;
        //String jsonBody = callAppointmentServiceAPI(getYearsEndPoint );
        //system.debug(' ## yearsList : '+jsonBody);
        Car_Care_Service_Setting__mdt setting = getCarCareServiceSettings(CarCareServiceConstants.Years_End_Point);
        if(setting != null && String.isNotBlank( setting.Setting_Value__c)){
        
           HTTPResponse res = callAppointmentServiceAPI(setting.Setting_Value__c );
            if(res != null && res.getStatusCode() == 200 ){
                String jsonBody = res.getBody();
                years = (ItemsWrap) System.JSON.deserialize(jsonBody, ItemsWrap.class);
            }
            else{
                years.hasException = true;
                years.exceptionMessage = 'Callout Failed due to '+ (res != null ? res.getStatus() : exceptionStr);
            }
        }
        //system.debug(' before Return yearsList : '+years);
        return years;
    }

    private static HTTPResponse callAppointmentServiceAPI(String endPoint ){
        //System.debug(' #### endPoint : '+endPoint);
        //endPoint = EncodingUtil.urlEncode(endPoint, 'UTF-8');
        //System.debug(' #### urlEncode endPoint : '+endPoint);
        HTTPResponse res = null;
        Car_Care_Service_Setting__mdt setting = getCarCareServiceSettings(CarCareServiceConstants.Authorization_Key);
        if(setting != null && String.isNotBlank( setting.Setting_Value__c)){
        
            HttpRequest req = new HttpRequest();
            req.setEndpoint(endPoint);
            req.setMethod('GET');
            req.setHeader('Content-Type','application/json'); 
            req.setHeader('Authorization', setting.Setting_Value__c);

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
        //System.debug(res.getStatusCode());
        //return res.getBody();
    }

    //Query Against Custom Metadata doesn't consider for 100 SOQL Governer limits, 
    private static Car_Care_Service_Setting__mdt getCarCareServiceSettings(String DeveloperName){
        Car_Care_Service_Setting__mdt carCareServiceSetting = new Car_Care_Service_Setting__mdt();
        for( Car_Care_Service_Setting__mdt Setting : [Select id, 
                                                            DeveloperName, 
                                                            Setting_Value__c 
                                                            from Car_Care_Service_Setting__mdt 
                                                            where Category__c =: CarCareServiceConstants.Appointment_Api_Str
                                                            AND DeveloperName =: DeveloperName]){
            
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

    /*public static String generateErrorMessage(HTTPResponse res){
        String integartionCallOutErrorMessage = '';
        if(res == null){
            integartionCallOutErrorMessage 
        }
        else{

        }
        return null;
    }*/

}