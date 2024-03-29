import {
  Controller,
  Get,
  Inject,
  Post,
  Req,
  Res,
  Body,
  Param,
  UseGuards,
  ConsoleLogger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { SlackService } from './slack.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { InjectRepository } from '@nestjs/typeorm';
import { Account } from '../accounts/entities/accounts.entity';
import { Repository } from 'typeorm';
import { Audience } from '../audiences/entities/audience.entity';
import { CustomersService } from '../customers/customers.service';

enum ResponseStatus {
  Ok = 200,
  Redirect = 302,
  NotFound = 404,
  Failure = 500,
}

@Controller('slack')
export class SlackController {
  constructor(
    @Inject(SlackService) private readonly slackService: SlackService
  ) {}

  @Get('install')
  async install() {
    return await this.slackService.handleInstallPath();
  }

  @Get('oauth_redirect')
  redirect(@Req() req: Request, @Res() res: Response) {
    this.slackService.handleOAuthRedirect(req, res);
  }

  /*
   * to do: need to check and modify for enterprise installs, what if account is not found?
   *
   * Adds slack team id to user object
   */
  @Get('cor/:teamid')
  @UseGuards(JwtAuthGuard)
  async cor(@Param('teamid') teamid: string, @Req() { user }: Request) {
    return await this.slackService.handleCorrelation(teamid, <Account>user);
  }

  @Post('events')
  handleEvents(@Body() body: any, @Res() res: Response) {
    this.slackService.handleEvent(res, body);
  }
}
