import { API } from 'homebridge';

import { PeimarInverterPlatform } from './platform';

/**
 * This is the name of the platform that users will use to register the plugin in the Homebridge config.json
 */
const PLATFORM_NAME = 'HomebridgePeimarInverter';

/**
  * This must match the name of your plugin as defined the package.json
  */
const PLUGIN_NAME = 'homebridge-peimar-inverter';

/**
 * This method registers the platform with Homebridge
 */
export = (api: API) => {
  api.registerPlatform(PLUGIN_NAME, PLATFORM_NAME, PeimarInverterPlatform);
};
