public with sharing class AppointmentIntegrationServices {

    public static string AuthorizationKey = 'B81KyUqIH6RF6CjUOcdnbqNl9kEpQO2dEgef8wv1tM6aYrcHp6sKcPuTrjldBWU';
    public static string storeEndPoint = 'https://apidev.aaacarolinas.net/AppointmentApi/api/Store';
    public static string serviceEndPoint = 'https://apidev.aaacarolinas.net/AppointmentApi/api/Store/{StoreId}/Services';
    
    @AuraEnabled(cacheable=true)
    public static AppointmentServiceObj getAllAvailableServices(String storeId){
        AppointmentServiceObj availableServices = new AppointmentServiceObj();
        if(String.isNotBlank(storeId)){
            
            String endPoint = serviceEndPoint.replace('{StoreId}',  storeId);
            String jsonBody = callAppointmentServiceAPI(endPoint );
            system.debug(' ## availableServices.items : '+jsonBody);
            availableServices = AppointmentServiceObj.parse(jsonBody);
            
        }
        system.debug(' before Return : '+availableServices.items);
        return availableServices;
    }

    private static String callAppointmentServiceAPI(String endPoint ){
        HttpRequest req = new HttpRequest();
        req.setEndpoint(endPoint);
        req.setMethod('GET');
        req.setHeader('Content-Type','application/json'); 
        req.setHeader('Authorization', AuthorizationKey);

        // Create a new http object to send the request object
        // A response object is generated as a result of the request  

        Http http = new Http();
        HTTPResponse res = http.send(req);
        System.debug(res.getBody());
        return res.getBody();
    }

    

}