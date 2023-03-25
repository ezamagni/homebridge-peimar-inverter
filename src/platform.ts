import { API, Logging, PlatformConfig, StaticPlatformPlugin, AccessoryPlugin } from 'homebridge';
import { Inverter, InverterConfiguration } from './inverter-accessory';

/**
 * PeimarInverterPlatform
 * This class is the main constructor for your plugin, this is where you should
 * parse the user config and discover/register accessories with Homebridge.
 */
export class PeimarInverterPlatform implements StaticPlatformPlugin {
  // public readonly Service: typeof Service = this.api.hap.Service;
  // public readonly Characteristic: typeof Characteristic = this.api.hap.Characteristic;

  constructor(
    public readonly log: Logging,
    public readonly config: PlatformConfig,
    public readonly api: API,
  ) {
    this.log.debug('Peimar inverter platform finished initializing!');
  }

  /*
   * This method is called to retrieve all accessories exposed by the platform.
   * The set of exposed accessories CANNOT change over the lifetime of the plugin!
   */
  accessories(callback: (foundAccessories: AccessoryPlugin[]) => void): void {
    callback([
      new Inverter(this.api.hap, this.log, 'Peimy', this.config as unknown as InverterConfiguration),
    ]);
  }
}
