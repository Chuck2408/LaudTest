import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from '../accounts/entities/accounts.entity';
import { AuthController } from './auth.controller';
import { AuthHelper } from './auth.helper';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { ApiKeyStrategy } from './strategies/apiKey.strategy';
import { Template } from '../templates/entities/template.entity';
import { Workflow } from '../workflows/entities/workflow.entity';
import { Audience } from '../audiences/entities/audience.entity';
import { Stats } from '../audiences/entities/stats.entity';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt', property: 'user' }),
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.JWT_KEY,
        signOptions: { expiresIn: process.env.JWT_EXPIRES },
      }),
    }),
    TypeOrmModule.forFeature([Account, Template, Workflow, Audience, Stats]),
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthHelper, JwtStrategy, ApiKeyStrategy],
  exports: [AuthService],
})
export class AuthModule {}
