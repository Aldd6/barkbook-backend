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

const KINSHIP = Object.freeze({
    PDR: "PADRE/MADRE",
    HRN: "HERMANO(A)",
    PRM: "PRIMO(A)",
    ABL: "ABUELO(A)",
    PRJ: "PAREJA",
    ESP: "ESPOSO(A)",
    HJO: "HIJO(A)"
})

module.exports = {
    TYPE_TRANSACTION,
    TYPE_TRANSACTION_ARRAY: Object.values(TYPE_TRANSACTION),
    METHOD_TRANSACTION,
    METHOD_TRANSACTION_ARRAY: Object.values(METHOD_TRANSACTION),
    KINSHIP,
    KINSHIP_ARRAY: Object.values(KINSHIP)
}