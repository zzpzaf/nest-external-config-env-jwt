import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Headers,
  UnauthorizedException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/dataObjects/user.entity';
import { CreateUserDto } from 'src/dataObjects/users-create-new.dto';
import { UserDataDto } from 'src/dataObjects/users-filter.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private userService: UsersService, private jwtService: JwtService, private configService: ConfigService) {}

  @Get()
  async getUsers(@Headers('Authorization') authorization = '', @Query() filterDto: UserDataDto): Promise<User[]> {

    let bearer: string = '';
   
    if (typeof authorization != 'undefined') {
      bearer = authorization.replace('Bearer ','');
    } 
    if (bearer === '') {
      throw new UnauthorizedException('No Token provided!');
    }

    const isValid = await this.isTokenValid(bearer);
    if (!isValid) {
      throw new UnauthorizedException('Invalid Token!');
    }
    return this.userService.getUsers(filterDto);
  }

  @Get('/:id') 
  getUserById(@Param('id') id: string): Promise<User> {
    return this.userService.getUserById(id);
  }

  @Post()
  createUser(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.userService.createUser(createUserDto);
  }

  @Patch('/:id/')
  updateUser(
    @Param('id') id: string,
    @Query() userDataDto: UserDataDto,
  ): Promise<User> {
    return this.userService.updateUser(id, userDataDto);
  }

  @Delete('/:id')
  deleteUserById(@Param('id') id: string): Promise<void> {
    const ret = this.userService.deleteUserById(id);
    return ret;
  }

  private async isTokenValid(bearerToken: string): Promise<boolean> {
    const verifyOptions = { secret: this.configService.get('JWT_SECRET') };
    let isValid: boolean = false;
    try {
      const payload = await this.jwtService.verifyAsync(bearerToken, verifyOptions);
      const { username, typeid, iat, exp } = payload;
     
      let user: User = new User();
      const filterDto: UserDataDto = {username: username}
      const users = await this.userService.getUsers(filterDto);
      user = users[0];

      if ((user) && (typeid < 3)) {
        isValid = true;
      }

    } catch (error) {
      throw new HttpException(error, HttpStatus.UNAUTHORIZED);
    }
    return isValid;
  }
}
