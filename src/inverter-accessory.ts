import {
  AccessoryPlugin,
  CharacteristicSetCallback,
  CharacteristicValue,
  HAP,
  Logging,
  Service,
  CharacteristicEventTypes,
} from 'homebridge';

import http from 'https';

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

export interface InverterConfiguration {
  address: string;
  port: number;
  updateInterval: number;
}
