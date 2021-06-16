import { Config } from 'src/config/config.entity';
import log from 'src/util/logger.functions';
const config = Config.load();
export function sleep(ms = -1) {
  if (ms == -1) {
    ms = config.time.interval;
  }
  // log.warn(['sleeping for', ms, '...']);
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
