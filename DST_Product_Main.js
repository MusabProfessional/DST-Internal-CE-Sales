var Product = Product || { namespace: true };
var environmentVariables = [];
Product.Main = {
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
    }
}