/**
 * Imports the Roast API URL from the config.
 */

import {ROAST_CONFIG} from "../config"

export default {

    /**
     * GET /api/v1/public/sendMessage
     */
    postPublicMessage: function (message) {
        return axios.post(ROAST_CONFIG.API_URL + '/chat/public/sendMessage', {
            message: message
        })
    },

}
