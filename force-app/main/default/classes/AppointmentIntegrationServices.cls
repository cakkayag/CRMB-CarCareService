public with sharing class AppointmentIntegrationServices {

    private static string AuthorizationKey = 'B81KyUqIH6RF6CjUOcdnbqNl9kEpQO2dEgef8wv1tM6aYrcHp6sKcPuTrjldBWU';
    private static string storeEndPoint = 'https://apidev.aaacarolinas.net/AppointmentApi/api/Store';
    private static string serviceEndPoint = 'https://apidev.aaacarolinas.net/AppointmentApi/api/Store/{branchId}/Services';
    private static string vehicleMakeEndPoint = 'https://apidev.aaacarolinas.net/AppointmentApi/api/Vehicle/GetMakes';
    private static string vehicleModelEndPoint = 'https://apidev.aaacarolinas.net/AppointmentApi/api/Vehicle/GetModels/{VehicleMake}?searchText={vehicleModel}';
    private static string getYearsEndPoint ='https://apidev.aaacarolinas.net/AppointmentApi/api/Vehicle/GetYears';
    private static Integer withInMiles = 10000;
    private static string exceptionStr = '';
    

    private static List<AAA_Location__c> getNearbyLocation(String branchId){
        // To fetch lat long values of selected store
        AAA_Location__c selectedLoc = [select name,Geocode__Latitude__s,Geocode__Longitude__s from AAA_Location__c where Car_Care_Location_Number__c =: branchId and Car_Care__c = true limit 1] ;
        Decimal latitude = selectedLoc.Geocode__Latitude__s;  // This will be our selected store lat value
        Decimal longitude = selectedLoc.Geocode__Longitude__s; // This will be our selected store long value

        //To get nearby locations within 10 miles…
        List<AAA_Location__c> Locations = new List<AAA_Location__c >([SELECT Car_Care_Location_Number__c ,
                                                                                Geocode__Latitude__s, 
                                                                                Geocode__Longitude__s,
                                                                                DISTANCE(Geocode__c, GEOLOCATION(:latitude,:longitude), 'mi') dist
                                                                                FROM AAA_Location__c
                                                                                where (DISTANCE(Geocode__c, GEOLOCATION(:latitude,:longitude), 'mi') > 0 
                                                                                and DISTANCE(Geocode__c, GEOLOCATION(:latitude,:longitude), 'mi') < withInMiles ) 
                                                                                and Car_Care__c = true
                                                                                ORDER BY
                                                                                DISTANCE( Geocode__c, GEOLOCATION( :latitude, :longitude ), 'mi' )   
                                                                                ]);
        
       
        return Locations;
    }

    @AuraEnabled(cacheable=true)
    public static List<AppointmentStoreObj.Items> getSelectedAndNearbyStoresList(String branchId){
        Map<Decimal , AppointmentStoreObj.Items> distanceToStoreMap = new Map<Decimal, AppointmentStoreObj.Items>();
        AppointmentStoreObj nearByStoresObj = new AppointmentStoreObj();
        if(String.isNotBlank(branchId)){
            AppointmentStoreObj.Items selectedStoreInfo = new AppointmentStoreObj.Items();
            
            HTTPResponse res = callAppointmentServiceAPI(storeEndPoint );
            if(res != null && res.getStatusCode() == 200 ){
                String jsonBody = res.getBody();
                system.debug(' getNearByStoreList : jsonBody : '+jsonBody);
                nearByStoresObj = AppointmentStoreObj.parseList(jsonBody);
                if(nearByStoresObj != null && nearByStoresObj.items != null){
                    Map<Integer , AppointmentStoreObj.Items> branchIdToStoreObjMap = new Map<Integer , AppointmentStoreObj.Items>();
                    for(AppointmentStoreObj.Items items : nearByStoresObj.items){
                        system.debug(' items   : '+items);
                        system.debug(' items.branchId   : '+items.branchId);
                        system.debug(' branchId.isNumeric()   : '+branchId.isNumeric());
                        if(items.branchId != null && branchId.isNumeric() ){
                            branchIdToStoreObjMap.put(items.branchId , items );
                            system.debug(' branchIdToStoreObjMap   : '+branchIdToStoreObjMap);
                            if(items.branchId ==  Integer.valueOf(branchId) ){
                                distanceToStoreMap.put(0.0 , items);
                            }
                        }
                    }
                    system.debug(' distanceToStoreMap 1st   : '+distanceToStoreMap);
                    List<AAA_Location__c> Locations = getNearbyLocation(branchId);
                    system.debug(' Locations    : '+Locations);
                    for(AAA_Location__c locationObj : Locations){
                        Integer carCareLocationNumber = String.isNotBlank(locationObj.Car_Care_Location_Number__c) &&
                                                        locationObj.Car_Care_Location_Number__c.isNumeric() 
                                                        ? Integer.valueOf(locationObj.Car_Care_Location_Number__c)
                                                        : null;
                        system.debug(' carCareLocationNumber    : '+carCareLocationNumber);
                        system.debug(' branchIdToStoreObjMap.containsKey(carCareLocationNumber)   : '+branchIdToStoreObjMap.containsKey(carCareLocationNumber));
                        system.debug(' branchIdToStoreObjMap.get(carCareLocationNumber)    : '+branchIdToStoreObjMap.get(carCareLocationNumber));
                        system.debug(' (Decimal)locationObj.get(\'dist\')    : '+(Decimal)locationObj.get('dist') );
                        if( carCareLocationNumber != null && branchIdToStoreObjMap.containsKey(carCareLocationNumber)){
                            system.debug(' locationObj    : '+locationObj);
                            distanceToStoreMap.put((Decimal)locationObj.get('dist') , branchIdToStoreObjMap.get(carCareLocationNumber));
                        }
                    }
                } 
                
            }
            else{
                //availableServices.hasException = true;
                //availableServices.exceptionMessage = 'Callout Failed due to '+ (res != null ? res.getStatus() : exceptionStr);
            }
            
        }
        system.debug(' before Return : '+distanceToStoreMap.values());
        return distanceToStoreMap != null && distanceToStoreMap.isEmpty() == false ? distanceToStoreMap.values() : new List<AppointmentStoreObj.Items>() ;
    }

    @AuraEnabled(cacheable=true)
    public static AppointmentServiceObj getAllAvailableServices(String storeId){
        AppointmentServiceObj availableServices = new AppointmentServiceObj();
        if(String.isNotBlank(storeId)){
            
            String endPoint = serviceEndPoint.replace('{StoreId}',  storeId);
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
        //system.debug(' before Return : '+availableServices.items);
        return availableServices;
    }

    @AuraEnabled(cacheable=true)
    public static ItemsWrap getAllVehicleMakes(){
        ItemsWrap vehicleMake = new ItemsWrap();
        //if(String.isNotBlank(vehicleMakeStr)){
            
            String endPoint = vehicleMakeEndPoint; //.replace('{VehicleMake}',  vehicleMakeStr);
            //String jsonBody = callAppointmentServiceAPI(endPoint );
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
            //
            
            
        //}
        //system.debug(' before Return vehicleMake : '+vehicleMake);
        return vehicleMake;
    }

    @AuraEnabled(cacheable=true)
    public static ItemsWrap getAllVehicleModelsByMakeSelected(String makeSelectedStr, String modelStr){
        ItemsWrap vehicleModel = new ItemsWrap();
        if(String.isNotBlank(makeSelectedStr) ){
            makeSelectedStr =  EncodingUtil.urlEncode(makeSelectedStr, 'UTF-8').replace('+', '%20') ;
            String endPoint = vehicleModelEndPoint.replace('{VehicleMake}',  makeSelectedStr).replace('{vehicleModel}',  modelStr);
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
        //system.debug(' before Return vehicleModelList : '+vehicleModel);
        return vehicleModel;
    }

    

    @AuraEnabled(cacheable=true)
    public static ItemsWrap getYears(){
        ItemsWrap years = new ItemsWrap();
        //String endPoint = getYearsEndPoint;
        //String jsonBody = callAppointmentServiceAPI(getYearsEndPoint );
        //system.debug(' ## yearsList : '+jsonBody);
        HTTPResponse res = callAppointmentServiceAPI(getYearsEndPoint );
        if(res != null && res.getStatusCode() == 200 ){
            String jsonBody = res.getBody();
            years = (ItemsWrap) System.JSON.deserialize(jsonBody, ItemsWrap.class);
        }
        else{
            years.hasException = true;
            years.exceptionMessage = 'Callout Failed due to '+ (res != null ? res.getStatus() : exceptionStr);
        }
        
        //system.debug(' before Return yearsList : '+years);
        return years;
    }

    private static HTTPResponse callAppointmentServiceAPI(String endPoint ){
        //System.debug(' #### endPoint : '+endPoint);
        //endPoint = EncodingUtil.urlEncode(endPoint, 'UTF-8');
        //System.debug(' #### urlEncode endPoint : '+endPoint);
        HttpRequest req = new HttpRequest();
        req.setEndpoint(endPoint);
        req.setMethod('GET');
        req.setHeader('Content-Type','application/json'); 
        req.setHeader('Authorization', AuthorizationKey);

        // Create a new http object to send the request object
        // A response object is generated as a result of the request  

        Http http = new Http();
        HTTPResponse res = null;
        try{
            system.debug('Started : '+System.now());
            res = http.send(req);
            system.debug('Ended : '+System.now());
        }
        catch(exception e){
            exceptionStr = e.getMessage();
            System.debug('## Exception : '+e.getMessage());
        }
        
        return res;
        //System.debug(res.getStatusCode());
        //return res.getBody();
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