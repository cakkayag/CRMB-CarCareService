public with sharing class AppointmentObj {
    @AuraEnabled public List<Days> days;
    @AuraEnabled public String businessHoursJSON;
    @AuraEnabled public List<Date> holidays;
    @AuraEnabled public Integer paginationForMobile;
    @AuraEnabled public Integer paginationForLaptop;
    @AuraEnabled public Integer paginationForTablet;
    @AuraEnabled public boolean hasException;
    @AuraEnabled public String exceptionMessage;

    public AppointmentObj(){
        days = new List<Days>(); 
        businessHoursJSON = '';
        holidays = new List<Date>();
        hasException = false;
        exceptionMessage = '';   
    }
    
	public class Days {
		@AuraEnabled public String dateVal;
		@AuraEnabled public String openTime;
		@AuraEnabled public String closeTime;
		@AuraEnabled public List<String> availableTimes;
	}

    
	
	public static List<Days> parse(String json) {
		List<Days> availableDayList = new List<Days>(); 
        Map<String, Object> result = (Map<String, Object>)System.JSON.deserializeUntyped(json );
        List<Object> dayList = (List<Object>)result.get('days');
        List<String> fieldNames = new List<String>();

        for(Object dayObj : dayList){
            Days day = new Days();
            Map<String, Object> objRec = (Map<String, Object>)dayObj;
            day.dateVal = (String)objRec.get('date'); 
            day.openTime = (String)objRec.get('openTime'); 
            day.closeTime = (String)objRec.get('closeTime'); 
            List<Object> availableTimeList = (List<Object>)objRec.get('availableTimes');
            day.availableTimes = new List<String>();
            for(Object availableTime : availableTimeList){
                day.availableTimes.add((String)availableTime);
            }

            availableDayList.add(day);
            
        }

		return availableDayList;
	}
}