import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DbRepo } from 'src/dataObjects/dbRepo';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';


const jwtFactory = {
  useFactory: async (configService: ConfigService) => ({
    secret: configService.get('JWT_SECRET'),
    signOptions: {
      expiresIn: configService.get('JWT_EXP_H'),
    },
  }),
  inject: [ConfigService],
};

@Module({
  imports: [
    JwtModule.registerAsync(jwtFactory),
  ],
  controllers: [AuthController],
  providers: [AuthService, DbRepo],
  exports: [DbRepo, JwtModule],
})
export class AuthModule {}
