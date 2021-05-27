import { Config } from 'src/config/config.entity';
import log from 'src/util/logger.functions';

const config = new Config();

export function sleep(ms: number = config.time.interval) {
  log.warn(['sleeping for', ms, '...']);
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
