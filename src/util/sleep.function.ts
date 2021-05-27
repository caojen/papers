import { Config } from 'src/config/config.entity';

const config = new Config();

export function sleep() {
  console.log('sleep...');
  return new Promise((resolve) => {
    setTimeout(resolve, config.time.interval);
  });
}
