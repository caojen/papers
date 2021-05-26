import { Injectable } from '@nestjs/common';
import * as requestAsync from 'request-promise-native';
@Injectable()
export class HttpService {
  async get(url: string, params: {
    page: number,
    search: string,
    filter: string
  }): Promise<Buffer> {
    const response = requestAsync(`${url}?page=${params.page}&search=${params.search}&filter=${params.filter}`, {
      method: 'GET',
      encoding: null
    });

    return response;
  }
}
