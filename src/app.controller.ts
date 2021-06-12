import { Body, Controller, Get, HttpException, Param, Post, Query } from '@nestjs/common';
import { query } from 'express';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('search')
  async addOneSearch(@Body() body: { v: string }) {
    const { v } = body;
    if(v === undefined || v.length === 0) {
      throw new HttpException({
        error: '参数错误，v无效'
      }, 406);
    }

    return await this.appService.addOneSearch(v);
  }

  @Get('search')
  async getAllSearch() {
    return await this.appService.getAllSearch();
  }

  @Get('content')
  async getContent(@Query() query: {
    sid: string,
    pageSize: string,
    offset: string
  }) {
    const { sid, pageSize, offset } = query;
    return await this.appService.getContent(parseInt(sid), parseInt(pageSize), parseInt(offset));
  }
}
