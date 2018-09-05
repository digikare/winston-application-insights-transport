
import Transport = require('winston-transport');
import { TelemetryClient } from 'applicationinsights';

import appInsights = require("applicationinsights")
import { SeverityLevel } from 'applicationinsights/out/Declarations/Contracts';

const DEFAULT_LEVEL: string = 'info';
const DEFAULT_SILENT: boolean = false;

interface ApplicationInsightTransportOptions extends Transport.TransportStreamOptions {
  /**
   * The instrumentation key
   */
  key?: string;

  /**
   * The AI instance
   */
  client?: TelemetryClient;

  appInsights?: any;
}

const winstonLevelsMap: {[level: string]: SeverityLevel} = {
  emerg: SeverityLevel.Critical,
  crit: SeverityLevel.Critical,
  error: SeverityLevel.Error,
  warn: SeverityLevel.Warning,
  warning: SeverityLevel.Warning,
  notice: SeverityLevel.Information,
  info: SeverityLevel.Information,
  verbose: SeverityLevel.Verbose,
  debug: SeverityLevel.Verbose,
  silly: SeverityLevel.Verbose,
};

/**
 *
 * @param winstonLevel
 */
function getLevelAi(winstonLevel: string): SeverityLevel {
  return winstonLevel in winstonLevelsMap ? winstonLevelsMap[winstonLevel] : SeverityLevel.Information;
}

export class ApplicationInsightsTransport extends Transport {

  private _client: TelemetryClient;
  private _silent: boolean;
  private _level: string;
  private _handleExceptions: boolean;

  constructor(options: ApplicationInsightTransportOptions = {}) {
    super(options);

    // if ai instance provided, use it
    if (options.client) {
      this._client = options.client;
    } else if (options.appInsights) {
      this._client = options.appInsights.defaultClient;
    } else {
      appInsights
        .setup(options.key)
        .start();
      this._client = appInsights.defaultClient;
    }

    this._silent = options.silent || DEFAULT_SILENT;
    this._level = options.level || DEFAULT_LEVEL;
    this._handleExceptions = options.handleExceptions || false;

    if (!this._client) {
      throw new Error('No Application Insights client instance found');
    }
  }

  log(info: any, callback: Function) {

    const level = info.level;
    const message = info.message;
    const meta = {...info};
    delete meta.level;
    delete meta.message;

    const aiLevel = getLevelAi(level);

    this._client.trackTrace({
      message: message,
      severity: aiLevel,
      properties: meta,
    });

    callback();
  }
};

