import { Config } from 'src/config/config.entity';
import log from 'src/util/logger.functions';

export function sleep(ms: number = -1) {
  if(ms == -1) {
    const config = new Config();
    ms = config.time.interval;
  }
  log.warn(['sleeping for', ms, '...']);
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
