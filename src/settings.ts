/**
 * This is the name of the platform that users will use to register the plugin in the Homebridge config.json
 */
export const PLATFORM_NAME = 'PeimarInverter';

/**
 * This must match the name of your plugin as defined the package.json `name` property
 */
export const PLUGIN_NAME = 'homebridge-peimar-inverter';

export interface InverterConfiguration {
  address: string;
  port: number;
  updateInterval: number;
}