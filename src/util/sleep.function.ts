import { Config } from 'src/config/config.entity';
import log from 'src/util/logger.functions';

const config = new Config();
const interval = config.time.interval;

export function sleep(ms: number = interval) {
  log.warn(['sleeping for', ms, '...']);
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
