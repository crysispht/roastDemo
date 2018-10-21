/**
 * Imports the Roast API URL from the config.
 */
import {ROAST_CONFIG} from "../config"

export default {
    /*
     GET   /api/v1/brew-methods
     */
    getBrewMethods: function () {
        return axios.get(ROAST_CONFIG.API_URL + '/brew-methods')
    }
}
