/**
 * Defines the API route we are using.
 */
let api_url = '';
let app_url = '';
let gaode_maps_js_api_key = '10dc8f591cf134c366cde9a6eb384d89';

switch (process.env.NODE_ENV) {
    case 'development':
        api_url = 'http://roast.com/api/v1';
        app_url = 'http://roast.com';
        break;
    case 'production':
        api_url = 'http://roast.demo.laravelacademy.org/api/v1';
        app_url = 'http://roast.demo.laravelacademy.org';
        break;
}


export const ROAST_CONFIG = {
    API_URL: api_url,
    GAODE_MAPS_JS_API_KEY: gaode_maps_js_api_key,
    APP_URL: app_url
}

