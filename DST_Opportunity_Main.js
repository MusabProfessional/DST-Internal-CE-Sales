var Opportunity = Opportunity || { namespace: true };
var environmentVariables = [];
Opportunity.Main = {
    //update the currency on account on change of country
    //Req 
    TaxAndDiscountCalculate: function (executionContext) {
        "use strict";
        var formContext = executionContext.getFormContext();

    var totalProjectSum = formContext.getAttribute("dst_totalprojectsumrry").getValue();
    var discountPercentage = formContext.getAttribute("dst_discountonprofessionalservices").getValue() || 0;
    var taxPercentage = formContext.getAttribute("dst_tax").getValue() || 0;

    if (totalProjectSum !== null) {
       
        var discountAmount = totalProjectSum * (discountPercentage / 100);
        formContext.getAttribute("dst_profservdiscountamount").setValue(discountAmount);

        var amountAfterDiscount = totalProjectSum - discountAmount;
        formContext.getAttribute("dst_totalprofessionalservicesexclusivetax").setValue(amountAfterDiscount);

    
        var taxAmount = amountAfterDiscount * (taxPercentage / 100);
        formContext.getAttribute("dst_profservtaxamount").setValue(taxAmount);

        var totalIncludingTax = amountAfterDiscount + taxAmount;
        formContext.getAttribute("dst_totalprofessionalservicesinclusivetax").setValue(totalIncludingTax);
    }
    }
};

