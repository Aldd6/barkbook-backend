const addressService = require('./address.service.js');
const StateResponseDTO = require('./DTOs/state-response.js');
const CityResponseDTO = require('./DTOs/city-response.js');

const getAllStates = async (req, res, next) => {
    try {
        const states = await addressService.getAllStates();
        const responseDTOs = states.map(s => StateResponseDTO.parse({
            id: s.id,
            stateName: s.stateName
        }));
        return res.status(200).json({
            success: true,
            status: 200,
            message: "Departamentos obtenidos exitosamente.",
            states: responseDTOs
        });
    } catch(error) {
        next(error);
    }
};

const getCitiesByState = async (req, res, next) => {
    try {
        const { stateId } = req.params;
        const cities = await addressService.getAllCitiesByState(stateId);
        const responseDTOs = cities.map(c => CityResponseDTO.parse({
            id: c.id,
            stateId: c.stateId,
            cityName: c.cityName
        }));
        return res.status(200).json({
            success: true,
            status: 200,
            message: "Municipios obtenidos exitosamente.",
            cities: responseDTOs
        });
    } catch(error) {
        next(error);
    }
};

module.exports = { getAllStates, getCitiesByState };
