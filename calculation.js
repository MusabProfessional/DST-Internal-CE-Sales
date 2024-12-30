function calculateAmounts(executionContext) {
    // Get form context
    var formContext = executionContext.getFormContext();

    // Retrieve field values
    var baseAmount = formContext.getAttribute("baseamount").getValue();
    var discountPercentage = formContext.getAttribute("dst_discount").getValue();
    var taxPercentage = formContext.getAttribute("dst_manualtaxpercentage").getValue();

    // Validate base amount
    if (baseAmount == null || baseAmount <= 0) {
        console.warn("Base amount should be greater than zero.");
        return;
    }

    // Set default values for null discount and tax percentages
    discountPercentage = discountPercentage || 0;
    taxPercentage = taxPercentage || 0;

    // Calculate discount amount
    var discountAmount = (discountPercentage / 100) * baseAmount;
    var amountAfterDiscount = baseAmount - discountAmount;

    // Calculate tax amount based on discounted amount
    var taxAmount = (taxPercentage / 100) * amountAfterDiscount;

    // Calculate final extended amount
    var extendedAmount = amountAfterDiscount - taxAmount;

    // Set calculated values in fields
    formContext.getAttribute("tax").setValue(taxAmount);
    formContext.getAttribute("extendedamount").setValue(extendedAmount);

}
