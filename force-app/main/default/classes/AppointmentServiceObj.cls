public with sharing class AppointmentServiceObj {
    
    @AuraEnabled public List<Items> items;

	public class Items {
		@AuraEnabled public Integer id;
		@AuraEnabled public String name;
		@AuraEnabled public String description;
		@AuraEnabled public Decimal price;
		@AuraEnabled public Boolean isPackage;
		@AuraEnabled public List<Children> children;
	}

	public class Children {
		@AuraEnabled public Integer id;
		@AuraEnabled public String name;
		@AuraEnabled public String description;
	}

    public static AppointmentServiceObj parse(String json) {
        return (AppointmentServiceObj) System.JSON.deserialize(json, AppointmentServiceObj.class);
	}

}