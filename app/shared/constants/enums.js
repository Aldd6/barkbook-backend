const TYPE_TRANSACTION = Object.freeze({
    WRITE: "WRT",
    READ: "READ",
    UPDATE: "UPD",
    ERRASE: "ERS"
});

module.exports = {
    TYPE_TRANSACTION,
    TYPE_TRANSACTION_ARRAY: Object.values(TYPE_TRANSACTION),
}