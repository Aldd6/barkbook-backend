const TYPE_TRANSACTION = Object.freeze({
    WRITE: "WRT",
    READ: "READ",
    UPDATE: "UPD",
    ERRASE: "ERS"
});

const METHOD_TRANSACTION = Object.freeze({
    GET: "GET",
    POST: "POST",
    PUT: "PUT",
    DELETE: "DELETE"
})

module.exports = {
    TYPE_TRANSACTION,
    TYPE_TRANSACTION_ARRAY: Object.values(TYPE_TRANSACTION),
    METHOD_TRANSACTION,
    METHOD_TRANSACTION_ARRAY: Object.values(METHOD_TRANSACTION)
}