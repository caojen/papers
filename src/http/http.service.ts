import { Injectable } from '@nestjs/common';
import * as requestAsync from 'request-promise-native';
import { Config } from 'src/config/config.entity';
import log from 'src/util/logger.functions';
import { sleep } from 'src/util/sleep.function';

const config = Config.load();

@Injectable()
export class HttpService {
  async gets(
    url: string,
    params: {
      page: number;
      search: string;
      filter: string;
    },
  ): Promise<string> {
    const u = `${url}?${config.ncbi.params.page}=${params.page}&${config.ncbi.params.term}=${params.search}&${config.ncbi.params.filter}=${params.filter}`;
    while (true) {
      try {
        const response: Buffer = await requestAsync(u, {
          method: 'GET',
          encoding: null,
        });

        return response.toString();
      } catch (err) {
        log.error(['fetch error, sleep and retry...']);
        await sleep();
      }
    }
  }

  async get(url: string): Promise<string> {
    while (true) {
      try {
        const response: Buffer = await requestAsync(url, {
          method: 'GET',
          encoding: null,
        });
        return response.toString();
      } catch (err) {
        log.error(['fetch error, sleep and retry...']);
        await sleep();
      }
    }
  }
}
