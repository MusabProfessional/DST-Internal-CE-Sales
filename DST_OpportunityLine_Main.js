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
        
                // Define the filter function
                var filterFunction = function () {
                    var filter = "<filter type='and'>" +
                        "<condition attribute='dst_producttitle' operator='eq' value='" + lookupId + "' />" +
                        "<condition attribute='dst_licenseagreementtype' operator='eq' value='" + licenseAgreeType + "' />" +
                        "</filter>";
        
                    // Add the filter to the lookup field
                    formContext.getControl("dst_products").addCustomFilter(filter, "product");
                };
        
                // Attach the filter function to the PreSearch event
                formContext.getControl("dst_products").addPreSearch(filterFunction);
        
                // Optional: Remove the PreSearch event handler if required later
                // formContext.getControl("dst_products").removePreSearch(filterFunction);
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
                        formContext.getAttribute("dst_listprice2").setValue(dst_listprice);
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
                    //formContext.getControl("dst_producttitle").removePreSearch(filter);

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
                            var termdurations = formContext.getAttribute("dst_termduration").getValue();
                            if(termdurations !== null){
                                if(termdurations === 860990000){
                                    formContext.getAttribute("dst_duration").setValue(36);
                                }
                                else if(termdurations === 860990001){
                                    formContext.getAttribute("dst_duration").setValue(12);
                                }
                                else if(termdurations === 860990002){
                                    formContext.getAttribute("dst_duration").setValue(1);
                                }       
                                else{
                                    formContext.getAttribute("dst_duration").setValue(null);
                                }
                            }
                        
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
                var lookupId = sourceLookup[0].id; 
                var lookupName = sourceLookup[0].name;
                var lookupEntityType = sourceLookup[0].entityType; 

            
                var targetLookupValue = [{
                    id: lookupId,
                    name: lookupName,
                    entityType: lookupEntityType
                }];

                formContext.getAttribute("productid").setValue(targetLookupValue); 
            } else {
            
                formContext.getAttribute("productid").setValue(null);
            }
        },

        durationSetByTermDuration: function(executionContext){
            "use strict";
            debugger;
            var formContext = executionContext.getFormContext();
            var termDuration = formContext.getAttribute("dst_termduration").getValue(); 
            
            //web api call to unit
                //if unit name == to texttermduration
                //set unit lookup
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

        // hideExistingProducts: function(executionContext){
        //     var formContext = executionContext.getFormContext();
        //     formContext.getControl("productid").setVisible(false);
        // },

        marginAmount: function(executionContext){
            var formContext = executionContext.getFormContext();
            var PricePerUnit = formContext.getAttribute("dst_priceperunit").getValue();
            var costPrice = formContext.getAttribute("dst_costprice").getValue();

            var marginAmount = PricePerUnit - costPrice;
            formContext.getAttribute("dst_marginamount").setValue(marginAmount);
            var MarginPercentage = (marginAmount/PricePerUnit) * 100;
            formContext.getAttribute("dst_marginpercentage").setValue(MarginPercentage);
        },

        calculateListPrice: function (executionContext) {
            var formContext = executionContext.getFormContext();
        
            var costPrice = formContext.getAttribute("dst_costprice").getValue();
            var listPrice = formContext.getAttribute("dst_listprice").getValue();
            var ActualmarginAmount = listPrice - costPrice;
            var ActualMarginPercentage = (ActualmarginAmount/listPrice) * 100;

            var marginPercentage = formContext.getAttribute("dst_marginpercentage").getValue();
            var duration = formContext.getAttribute("dst_duration").getValue();

        if(marginPercentage <= ActualMarginPercentage){
            if (costPrice !== null && marginPercentage !== null) {
            
                var PricePerUnit = costPrice / (1 - (marginPercentage / 100));
                var BaseAmount = PricePerUnit * duration;
                formContext.getAttribute("priceperunit").setValue(BaseAmount);
                formContext.getAttribute("dst_priceperunit").setValue(PricePerUnit);
                formContext.ui.clearFormNotification("valueRestriction");
            } else {
            
                formContext.getAttribute("priceperunit").setValue(null);
                formContext.getAttribute("dst_priceperunit").setValue(null);
            }
        }
        else{
            formContext.ui.setFormNotification("Margin Percentage cannot be greater than " + ActualMarginPercentage + "%", "ERROR", "valueRestriction");
        }
        },
        fetchProductPrice: function(executionContext){
            debugger;
            var formContext = executionContext.getFormContext();
            var unitContains = formContext.getAttribute("dst_unitcontains").getValue();
            var unit = formContext.getAttribute("uomid").getValue();
            var productLookupValue = formContext.getAttribute("dst_products").getValue();
            var currencyValue = formContext.getAttribute("transactioncurrencyid").getValue();
            var quantity = formContext.getAttribute("quantity").getValue();

            if(quantity !== null){
            if(productLookupValue !== null){
                Xrm.WebApi.retrieveMultipleRecords("productpricelevel", "?$select=amount&$filter=(_productid_value eq "+ productLookupValue[0].id + "and _transactioncurrencyid_value eq" + currencyValue[0].id +" and _uomid_value eq "+ unit[0].id + ")").then(
                    function success(results) {
                        console.log(results);
                        for (var i = 0; i < results.entities.length; i++) {
                            var result = results.entities[i];
                            // Columns
                            var productpricelevelid = result["productpricelevelid"]; // Guid
                            var amount = result["amount"]; // Currency

                            formContext.getAttribute("dst_priceperunit").setValue(amount);
                            formContext.getAttribute("priceperunit").setValue(amount);
                        }
                    },
                    function(error) {
                        console.log(error.message);
                    }
                );
            } 
        }
        else{
            formContext.getAttribute("dst_priceperunit").setValue(null);
            formContext.getAttribute("priceperunit").setValue(null);
        }  
        },
        //Setting of Price Per Unit based on the term Duration
        productPricePerUnitByTermDuration: function(executionContext){
            debugger;
            var formContext = executionContext.getFormContext();
            var productLookupValue = formContext.getAttribute("dst_products").getValue();
            var termDurationLabel = formContext.getAttribute("dst_termduration").getText();
            if (productLookupValue !== null) {
                // Web API call to retrieve price list items
                Xrm.WebApi.retrieveMultipleRecords("productpricelevel", "?$select=amount,_productid_value,_uomid_value,dst_costprice&$filter=_productid_value eq " + productLookupValue[0].id)
                .then(
                    function success(results) {
                        console.log(results);
                        let priceFound = false;
                        for (var i = 0; i < results.entities.length; i++) {
                            var result = results.entities[i];
                            var amount = result["amount"]; // Currency
                            var costPrice = result["dst_costprice"]; // Cost Price
                            var uomid = result["_uomid_value"]; // Lookup
                            var uomid_formatted = result["_uomid_value@OData.Community.Display.V1.FormattedValue"];
                            var uomid_lookuplogicalname = result["_uomid_value@Microsoft.Dynamics.CRM.lookuplogicalname"];
                            var unitset = [{
                                id: uomid,
                                name: uomid_formatted,
                                entityType: uomid_lookuplogicalname
                            }];
        
                            // Use switch statement for checking term duration label
                            switch (uomid_formatted) {
                                case termDurationLabel:
                                    formContext.getAttribute("dst_priceperunit").setValue(amount);
                                    formContext.getAttribute("priceperunit").setValue(amount);
                                    formContext.getAttribute("dst_listprice").setValue(amount);
                                    formContext.getAttribute("uomid").setValue(unitset);
                                    formContext.getAttribute("dst_costprice").setValue(costPrice);
                                    priceFound = true;
                                    break;
                            }
                        }
                        if (!priceFound) {
                            formContext.getAttribute("dst_priceperunit").setValue(null);
                            formContext.getAttribute("priceperunit").setValue(null);
                            formContext.getAttribute("dst_costprice").setValue(null);
                            formContext.getAttribute("dst_listprice").setValue(null);
                            formContext.getAttribute("uomid").setValue(null);
                        }
                    },
                    function(error) {
                        console.log(error.message);
                    }
                );
            } else {
                formContext.getAttribute("dst_priceperunit").setValue(null);
                formContext.getAttribute("priceperunit").setValue(null);
                formContext.getAttribute("dst_costprice").setValue(null);
            }
        }

        // calculateTotalAmount: function(executionContext){
        //     debugger;
        //     var formContext = executionContext.getFormContext();
        //     var PricePerUnit = formContext.getAttribute("priceperunit").getValue();
        //     var duration = formContext.getAttribute("dst_duration").getValue();
        //     if(PricePerUnit !== null && duration !== null)
        //         {
        //            var totalAmount = PricePerUnit * duration;
        //            alert(totalAmount);
        //            formContext.getAttribute("baseamount").setValue(totalAmount);
        //         }
        // }
    };