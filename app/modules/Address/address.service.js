const dbConnection = require('../../shared/utils/index.js');
const State = dbConnection.State;
const City = dbConnection.City;
const { ApiError } = require('../../shared/utils/errors.js');

const getAllStates = async () => {
    const states = await State.findAll();
    return states;    
};

const getAllCitiesByState = async (stateId) => {
    const state = await State.findByPk(stateId);
    if(!state) throw new ApiError(`El departamento con el ID ${stateId} no existe.`, "RESOURCE_NOT_FOUND");
    const cities = await City.findAll({
        where: { stateId: stateId }
    });
    return cities;
}

module.exports = { getAllStates, getAllCitiesByState };