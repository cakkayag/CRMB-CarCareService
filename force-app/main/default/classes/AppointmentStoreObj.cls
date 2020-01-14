public with sharing class AppointmentStoreObj {
    
    public List<Items> items;

	public class Items {
		@AuraEnabled public Integer id {get;set;} 
		@AuraEnabled public Integer branchId {get;set;} 
		@AuraEnabled public String name {get;set;} 
		@AuraEnabled public String description {get;set;} 
		@AuraEnabled public String street1 {get;set;} 
		@AuraEnabled public String street2 {get;set;} 
		@AuraEnabled public String city {get;set;} 
		@AuraEnabled public String state {get;set;} 
		@AuraEnabled public String zip {get;set;} 
		@AuraEnabled public String phone {get;set;} 
		@AuraEnabled public String url {get;set;} 
		@AuraEnabled public String imageUrl {get;set;}
		@AuraEnabled public String status {get;set;} 
		@AuraEnabled public List<StoreHours> storeHours {get;set;} 
	}

    

    public class StoreHours {
		@AuraEnabled public String day {get;set;} 
		@AuraEnabled public String hours {get;set;} 
	}

    public static Items parse(String json) {
        return (Items) System.JSON.deserialize(json, Items.class);
	}

    public static AppointmentStoreObj parseList(String json) {
        return (AppointmentStoreObj) System.JSON.deserialize(json, AppointmentStoreObj.class);
	}
}