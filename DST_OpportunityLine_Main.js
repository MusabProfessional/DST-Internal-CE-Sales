var OpportunityLine = OpportunityLine || { namespace: true };
var environmentVariables = [];
OpportunityLine.Main = {
    //filtering Product Family basis on the License Agreement Type
    //Req 
    filterExistingProduct: function (executionContext) {
        "use strict";
        debugger;
        var formContext = executionContext.getFormContext();
        var producttitle = formContext.getAttribute("dst_producttitle").getValue();
        var licenseAgreeType = formContext.getAttribute("dst_licenseagreementtype").getValue();
        
        if (producttitle != null && licenseAgreeType != null) {
            var lookupId = producttitle[0].id;
    
            formContext.getControl("dst_products").addPreSearch(function(){
                var filter = "<filter type='and'><condition attribute='dst_producttitle' operator='eq' value='" + lookupId + "' />"+
                "<condition attribute='dst_licenseagreementtype' operator='eq' value='" + licenseAgreeType + "' /></filter>";
            
                formContext.getControl("dst_products").removePreSearch(filter);
    
                // Add the filter to the lookup field
                formContext.getControl("dst_products").addCustomFilter(filter, "product");

                
            });
        }
    },
// Product Data Mapping -----------------------------------------------------------------
    productData: function (executionContext){
        "use strict";
        var formContext = executionContext.getFormContext();
        var productlookup = formContext.getAttribute("dst_products").getValue();

        if(formContext.getAttribute("dst_products").getValue()!= null){
            var lookupId = productlookup[0].id;
            Xrm.WebApi.retrieveRecord("product", lookupId, "?$select=dst_billingplan,dst_costprice,dst_listprice,dst_termduration,_defaultuomid_value").then(
                function success(result) {
                    console.log(result);
                    // Columns
                    var productid = result["dst_products"]; // Guid
                    var dst_billingplan = result["dst_billingplan"]; // Choice
                    var dst_billingplan_formatted = result["dst_billingplan@OData.Community.Display.V1.FormattedValue"];
                    var dst_costprice = result["dst_costprice"]; // Currency
                    var dst_listprice = result["dst_listprice"]; // Currency
                    var dst_termduration = result["dst_termduration"]; // Choice
                    var dst_termduration_formatted = result["dst_termduration@OData.Community.Display.V1.FormattedValue"];

                // Unit group
                var productid = result["productid"]; // Guid
                var defaultuomid = result["_defaultuomid_value"]; // Lookup
                var defaultuomid_formatted = result["_defaultuomid_value@OData.Community.Display.V1.FormattedValue"];
                var defaultuomid_lookuplogicalname = result["_defaultuomid_value@Microsoft.Dynamics.CRM.lookuplogicalname"];
                var lookupValue = [{
                    id: defaultuomid, // GUID of the lookup
                    name: defaultuomid_formatted, // Name of the lookup
                    entityType: defaultuomid_lookuplogicalname // Logical name of the entity
                }];
    
                    formContext.getAttribute("dst_costprice").setValue(dst_costprice);
                    formContext.getAttribute("dst_listprice").setValue(dst_listprice);
                    formContext.getAttribute("uomid").setValue(lookupValue);
                },
                function(error) {
                    console.log(error.message);
                }
            );
        }
        
    },

    // Product Title Filter ---------------------------------------------------------------
    filterProductTitle: function(executionContext){
        "use strict";
        debugger;
        var formContext = executionContext.getFormContext();
        
        if(formContext.getAttribute("dst_type").getValue() != null){
            formContext.getAttribute("dst_producttitle").setValue(null);
            formContext.getControl("dst_producttitle").addPreSearch(function(){
                var type = formContext.getAttribute("dst_type").getValue();
                var filter = "<filter type='and'><condition attribute='dst_type' operator='eq' value='" + type + "' /></filter>";
                formContext.getControl("dst_producttitle").removePreSearch(filter);

//Populate the filter values into lookup field
formContext.getControl("dst_producttitle").addCustomFilter(filter, "dst_producttitle");
});
    }
},

    // Term Duration Setup ------------------------------------------------------------
    termDurationMap: function(executionContext){
        "use strict";
        debugger;
        var formContext = executionContext.getFormContext();
        var lookupField = formContext.getAttribute("dst_producttitle").getValue();

            if (lookupField != null) {
                var lookupId = lookupField[0].id;
                Xrm.WebApi.retrieveRecord("dst_producttitle", lookupId, "?$select=dst_termduration").then(
                    function success(result) {
                        console.log(result);
                        // Columns
                        var dst_producttitleid = result["dst_producttitleid"]; // Guid
                        var dst_termduration = result["dst_termduration"]; // Choice
                        var dst_termduration_formatted = result["dst_termduration@OData.Community.Display.V1.FormattedValue"];
    
                        formContext.getAttribute("dst_termduration").setValue(dst_termduration);
                    },
                    function(error) {
                        console.log(error.message);
                    }
                );
            }
    },
    mapProductToExistingProduct: function(executionContext){
        "use strict";
        debugger;
        var formContext = executionContext.getFormContext();

        var sourceLookup = formContext.getAttribute("dst_products").getValue(); 

        if (sourceLookup) {
            var lookupId = sourceLookup[0].id; // Get the GUID
            var lookupName = sourceLookup[0].name; // Get the Name
            var lookupEntityType = sourceLookup[0].entityType; // Get the Entity Type

            // Set the retrieved value to the second lookup field
            var targetLookupValue = [{
                id: lookupId,
                name: lookupName,
                entityType: lookupEntityType
            }];

            formContext.getAttribute("productid").setValue(targetLookupValue); 
        } else {
            // Clear the target lookup if the source lookup has no value
            formContext.getAttribute("productid").setValue(null);
        }
    },

    durationSetByTermDuration: function(executionContext){
        "use strict";
        debugger;
        var formContext = executionContext.getFormContext();
        var termDuration = formContext.getAttribute("dst_termduration").getValue(); 

        if(termDuration === 860990000){
            formContext.getAttribute("dst_duration").setValue(36);
        }
        else if(termDuration === 860990001){
            formContext.getAttribute("dst_duration").setValue(12);
        }
        else if(termDuration === 860990002){
            formContext.getAttribute("dst_duration").setValue(1);
        }
        else{
            formContext.getAttribute("dst_duration").setValue(null);
        }
    },

    hideExistingProducts: function(executionContext){
        var formContext = executionContext.getFormContext();
        formContext.getControl("productid").setVisible(false);
    },

    marginAmount: function(executionContext){
        var formContext = executionContext.getFormContext();
        var listPrice = formContext.getAttribute("dst_listprice").getValue();
        var costPrice = formContext.getAttribute("dst_costprice").getValue();
        var marginAmount = listPrice - costPrice;
        formContext.getAttribute("dst_marginamount").setValue(marginAmount);
        var MarginPercentage = (marginAmount/listPrice) * 100;
        formContext.getAttribute("dst_marginpercentage").setValue(MarginPercentage);
    },

    calculateListPrice: function (executionContext) {
        var formContext = executionContext.getFormContext();
    
        // Get the values of cost price and margin percentage
        var costPrice = formContext.getAttribute("dst_costprice").getValue();
        var marginPercentage = formContext.getAttribute("dst_marginpercentage").getValue();
    
        if (costPrice !== null && marginPercentage !== null) {
            // Calculate the list price using the margin percentage formula
            var listPrice = costPrice / (1 - (marginPercentage / 100));
            formContext.getAttribute("dst_listprice").setValue(listPrice);
        } else {
            // Clear the list price field if required values are missing
            formContext.getAttribute("dst_listprice").setValue(null);
        }
    }
    
};