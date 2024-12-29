import {
  CharacteristicSetCallback,
  CharacteristicValue,
  HAP,
  Service,
  CharacteristicEventTypes,
  PlatformAccessory,
} from 'homebridge';

import http from 'https';
import { PeimarInverterPlatform } from './platform';

export class InverterAccessory {

  private readonly service: Service;
  private readonly timer: NodeJS.Timer;

  constructor(
    private readonly platform: PeimarInverterPlatform,
    private readonly accessory: PlatformAccessory,
  ) {
    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, 'Peimar');

    this.service = this.accessory.getService(this.platform.Service.LightSensor) ||
      this.accessory.addService(this.platform.Service.LightSensor);

    // set the service name, this is what is displayed as the default name on the Home app.
    this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.name);

    // Set up timer for updates
    this.timer = setInterval(
      () => this.fetchPower(),
      accessory.context.device.updateInterval * 1000,
    );

    // Initial power update
    this.fetchPower();
  }

  private fetchPower() {
    this.platform.log.debug('Attempting to reach inverter server.');

    const options: http.RequestOptions = {
      hostname: this.accessory.context.device.ip,
      port: this.accessory.context.device.port,
      path: '/status/status.php',
      method: 'GET',
    };

    const req = http.request(options, res => {
      res.on('data', data => {
        this.platform.log.debug('data: %s', data);
      });
    });

    req.on('error', error => {
      this.platform.log.error('error fetching inverter data: %s', error);
    });

    req.end();
  }
}

/*
export class Inverter implements AccessoryPlugin {
  private readonly log: Logging;

  name: string;

  private readonly config: InverterConfiguration;
  private readonly lightSensorService: Service;
  private readonly informationService: Service;
  private readonly timer: NodeJS.Timer;

  constructor(hap: HAP, log: Logging, name: string, configuration: InverterConfiguration) {
    this.log = log;
    this.name = name;
    this.config = configuration;

    this.lightSensorService = new hap.Service.LightSensor(name);

    this.informationService = new hap.Service.AccessoryInformation()
      .setCharacteristic(hap.Characteristic.Manufacturer, 'Peimar');

    this.timer = setInterval(
      () => log.info('Tick'),
      configuration.updateInterval * 1000,
    );

    log.info('Inverter \'%s\' created!', name);

    this.updateCurrentPower();
  }

  getServices(): Service[] {
    return [
      this.informationService,
      this.lightSensorService,
    ];
  }

  private updateCurrentPower() {
    this.log.debug('Attempting to reach inverter server.');

    const options: http.RequestOptions = {
      hostname: this.config.address,
      port: this.config.port,
      path: '/status/status.php',
      method: 'GET',
    };

    const req = http.request(options, res => {
      this.log.debug(`statusCode: ${res.statusCode}`);
      res.on('data', data => {
        this.log.debug('data: %s', data);
      });
    });

    req.on('error', error => {
      this.log.error('error fetching inverter data: %s', error);
    });

    req.end();
  }
}
*/
