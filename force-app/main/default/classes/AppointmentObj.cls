public with sharing class AppointmentObj {
    @AuraEnabled public List<Days> days;
    @AuraEnabled public Integer paginationForMobile;
    @AuraEnabled public Integer paginationForLaptop;
    @AuraEnabled public boolean hasException;
    @AuraEnabled public String exceptionMessage;

    public AppointmentObj(){
        days = new List<Days>(); 
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
		json = '{"days":[{"date":"1/21/2020 12:00:00 AM","openTime":"07:30:00","closeTime":"18:00:00","availableTimes":["07:30:00","08:00:00","08:30:00","09:00:00","09:30:00","10:00:00","10:30:00","11:00:00","11:30:00","12:00:00","12:30:00","13:00:00","13:30:00","14:00:00","14:30:00","15:00:00","15:30:00","16:00:00","16:30:00"]},{"date":"1/22/2020 12:00:00 AM","openTime":"07:30:00","closeTime":"18:00:00","availableTimes":["07:30:00","08:00:00","08:30:00","09:00:00","09:30:00","10:00:00","10:30:00","11:00:00","11:30:00","12:00:00","12:30:00","13:00:00","13:30:00","14:00:00","14:30:00","15:00:00","15:30:00","16:00:00","16:30:00"]},{"date":"1/23/2020 12:00:00 AM","openTime":"07:30:00","closeTime":"18:00:00","availableTimes":["07:30:00","08:00:00","08:30:00","09:00:00","09:30:00","10:00:00","10:30:00","11:00:00","11:30:00","12:00:00","12:30:00","13:00:00","13:30:00","14:00:00","14:30:00","15:00:00","15:30:00","16:00:00","16:30:00"]},{"date":"1/24/2020 12:00:00 AM","openTime":"07:30:00","closeTime":"18:00:00","availableTimes":["07:30:00","08:00:00","08:30:00","09:00:00","09:30:00","10:00:00","10:30:00","11:00:00","11:30:00","12:00:00","12:30:00","13:00:00","13:30:00","14:00:00","14:30:00","15:00:00","15:30:00","16:00:00","16:30:00"]},{"date":"1/25/2020 12:00:00 AM","openTime":"08:00:00","closeTime":"16:00:00","availableTimes":["08:00:00","08:30:00","09:00:00","09:30:00","10:00:00","10:30:00","11:00:00","11:30:00","12:00:00","12:30:00","13:00:00","13:30:00","14:00:00","14:30:00"]},{"date":"1/27/2020 12:00:00 AM","openTime":"07:30:00","closeTime":"18:00:00","availableTimes":["07:30:00","08:00:00","08:30:00","09:00:00","09:30:00","10:00:00","10:30:00","11:00:00","11:30:00","12:00:00","12:30:00","13:00:00","13:30:00","14:00:00","14:30:00","15:00:00","15:30:00","16:00:00","16:30:00"]}]}';
        List<Days> availableDayList = new List<Days>(); 
        Map<String, Object> result = (Map<String, Object>)System.JSON.deserialize(json , Map<String, Object>.class);
        List<Object> dayList = (List<Object>)result.get('days');
        List<String> fieldNames = new List<String>();

        for(Object dayObj : dayList){
            Days day = new Days();
            Map<String, String> objRec = (Map<String, String>)dayObj;
            day.dateVal = objRec.get('date'); 
            day.openTime = objRec.get('openTime'); 
            day.closeTime = objRec.get('closeTime'); 
            day.availableTimes = (List<String>)System.JSON.deserialize(objRec.get('availableTimes') , List<String>.class); 
            availableDayList.add(day);
        }

		return availableDayList;
	}
}