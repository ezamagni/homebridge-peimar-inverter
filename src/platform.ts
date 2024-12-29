import type { API, Characteristic, DynamicPlatformPlugin, Logging, PlatformAccessory, PlatformConfig, Service } from 'homebridge';

import { InverterAccessory } from './inverter-accessory.js';
import { PLATFORM_NAME, PLUGIN_NAME } from './settings.js';

/**
 * PeimarInverterPlatform
 * This class is the main constructor for your plugin, this is where you should
 * parse the user config and discover/register accessories with Homebridge.
 */
export class PeimarInverterPlatform implements DynamicPlatformPlugin {
  public readonly Service: typeof Service;
  public readonly Characteristic: typeof Characteristic;

  // this is used to track restored cached accessories
  public readonly accessories: Map<string, PlatformAccessory> = new Map();
  public readonly discoveredCacheUUIDs: string[] = [];
  private readonly inverters: any[]; // Store inverter configs

  constructor(
    public readonly log: Logging,
    public readonly config: PlatformConfig,
    public readonly api: API,
  ) {
    this.Service = api.hap.Service;
    this.Characteristic = api.hap.Characteristic;

    // Get inverters from config
    this.inverters = this.config.inverters || [];
    if (this.inverters.length === 0) {
      this.log.warn('No inverters configured. Please add inverters in the Homebridge config.');
    } else {
      this.log.debug('Loaded configuration:', JSON.stringify(this.config));
    }

    this.log.debug('Finished initializing platform:', this.config.name);

    // When this event is fired it means Homebridge has restored all cached accessories from disk.
    // Dynamic Platform plugins should only register new accessories after this event was fired,
    // in order to ensure they weren't added to homebridge already.
    // This event can also be used to start discovery of new accessories.
    this.api.on('didFinishLaunching', () => {
      log.debug('Executed didFinishLaunching callback');
      // run the method to discover / register your devices as accessories
      this.discoverDevices();
    });
  }

  /**
   * This function is invoked when homebridge restores cached accessories from disk at startup.
   * It should be used to setup event handlers for characteristics and update respective values.
   */
  configureAccessory(accessory: PlatformAccessory): void {
    this.log.info('Loading accessory from cache:', accessory.displayName);
    
    // add the restored accessory to the accessories cache, so we can track if it has already been registered
    this.accessories.set(accessory.UUID, accessory);
  }

  discoverDevices() {
    for (const inverter of this.inverters) {
      // Generate UUID from inverter name
      const uuid = this.api.hap.uuid.generate(inverter.name);
      const existingAccessory = this.accessories.get(uuid);

      if (existingAccessory) {
        this.log.info('Restoring existing inverter from cache:', inverter.name);
        
        // Update context with latest config
        existingAccessory.context.device = inverter;
        this.api.updatePlatformAccessories([existingAccessory]);
        
        new InverterAccessory(this, existingAccessory);
      } else {
        this.log.info('Adding inverter:', inverter.name);

        const accessory = new this.api.platformAccessory(inverter.name, uuid);
        accessory.context.device = inverter;

        new InverterAccessory(this, accessory);
        this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
      }

      this.discoveredCacheUUIDs.push(uuid);
    }

    // deal with inverters from the cache which are no longer present by removing them
    for (const [uuid, accessory] of this.accessories) {
      if (!this.discoveredCacheUUIDs.includes(uuid)) {
        this.log.info('Removing stale accessory from cache:', accessory.displayName);
        this.api.unregisterPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
      }
    }
  }
}
