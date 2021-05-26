import { Injectable } from '@nestjs/common';
import * as requestAsync from 'request-promise-native';
import { Config } from 'src/config/config.entity';

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

    const response = requestAsync(u, {
      method: 'GET',
      encoding: null,
    });

    return response;
  }

  async get(url: string): Promise<string> {
    const response = requestAsync(url, {
      method: 'GET',
      encoding: null
    });
    // const response = '';
    // console.log('getting url', url);
    return response;
  }
}
