public with sharing class AppointmentIntegrationServices {

    private static string AuthorizationKey = 'B81KyUqIH6RF6CjUOcdnbqNl9kEpQO2dEgef8wv1tM6aYrcHp6sKcPuTrjldBWU';
    private static string storeEndPoint = 'https://apidev.aaacarolinas.net/AppointmentApi/api/Store/{StoreId}';
    private static string serviceEndPoint = 'https://apidev.aaacarolinas.net/AppointmentApi/api/Store/{StoreId}/Services';
    private static string vehicleMakeEndPoint = 'https://apidev.aaacarolinas.net/AppointmentApi/api/Vehicle/GetMakes';
    private static string vehicleModelEndPoint = 'https://apidev.aaacarolinas.net/AppointmentApi/api/Vehicle/GetModels/{VehicleMake}?searchText={vehicleModel}';
    private static string getYearsEndPoint ='https://apidev.aaacarolinas.net/AppointmentApi/api/Vehicle/GetYears';
    private static string exceptionStr = '';

    @AuraEnabled(cacheable=true)
    public static AppointmentStoreObj getNearByStoreList(String branchId){
        AppointmentStoreObj nearByStoresObj = new AppointmentStoreObj();
        if(String.isNotBlank(branchId)){
            
            String endPoint = storeEndPoint.replace('/{StoreId}',  '');
            
            HTTPResponse res = callAppointmentServiceAPI(endPoint );
            if(res != null && res.getStatusCode() == 200 ){
                String jsonBody = res.getBody();
                system.debug(' getNearByStoreList : jsonBody : '+jsonBody);
                nearByStoresObj = AppointmentStoreObj.parseList(jsonBody);
            }
            else{
                //availableServices.hasException = true;
                //availableServices.exceptionMessage = 'Callout Failed due to '+ (res != null ? res.getStatus() : exceptionStr);
            }
        }
        //system.debug(' before Return : '+availableServices.items);
        return nearByStoresObj;
    }

    @AuraEnabled(cacheable=true)
    public static List<AppointmentStoreObj.Items> getStoreInfo(String storeId){
        List<AppointmentStoreObj.Items> selectedAndNearbystoreList = new List<AppointmentStoreObj.Items>();
        if(String.isNotBlank(storeId)){
            AppointmentStoreObj.Items selectedStoreInfo = new AppointmentStoreObj.Items();
            String endPoint = storeEndPoint.replace('{StoreId}',  storeId);
            
            HTTPResponse res = callAppointmentServiceAPI(endPoint );
            if(res != null && res.getStatusCode() == 200 ){
                String jsonBody = res.getBody();
                selectedStoreInfo = AppointmentStoreObj.parse(jsonBody);
                selectedAndNearbystoreList.add(selectedStoreInfo);
                //TODO : Need to update this logic to bring near by Stores
                AppointmentStoreObj selectedAndNearbystoreTemp = getNearByStoreList(''+selectedStoreInfo.branchId);
                if(selectedAndNearbystoreTemp != null && selectedAndNearbystoreTemp.items != null && 
                    selectedAndNearbystoreTemp.items.isEmpty() == false){
                    selectedAndNearbystoreList.addAll(selectedAndNearbystoreTemp.items);
                }
                //TODO : Need to update this logic to bring near by Stores
            }
            else{
                //availableServices.hasException = true;
                //availableServices.exceptionMessage = 'Callout Failed due to '+ (res != null ? res.getStatus() : exceptionStr);
            }
        }
        //system.debug(' before Return : '+availableServices.items);
        return selectedAndNearbystoreList;
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