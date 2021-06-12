import { Body, Controller, Get, HttpException, Param, Post } from '@nestjs/common';
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
  async getContent(@Param() params: {
    sid: number,
    pageSize: number,
    offset: number
  }) {
    const { sid, pageSize, offset } = params;
    return await this.appService.getContent(sid, pageSize, offset);
  }
}
