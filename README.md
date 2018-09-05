# winston-application-insights-transport

Application insights transport for winston >= 3.x

## Usage

```
import { ApplicationInsightsTransport } from 'winston-application-insights-transport';

// {...}

const logger = winston.createLogger({
  transports: [
    new ApplicationInsightsTransport({
      key: "__INSTRUMENTATION_KEY__",
    }),
  ]
});
```
