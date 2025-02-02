import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { SignupDto } from './dtos/signupdto';
import { User } from './schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dtos/login.dto';
import { JwtService } from '@nestjs/jwt';
import { RefreshToken } from './schemas/refresh-token.schema';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private UserModel: Model<User>,
    @InjectModel(RefreshToken.name)
    private RefreshTokenModel: Model<RefreshToken>,
    private jwtService: JwtService,
  ) {}

  async signup(signupData: SignupDto) {
    const { email, name, password } = signupData;

    //check if email in use
    const emailInUse = await this.UserModel.findOne({
      email,
    });
    if (emailInUse) {
      throw new BadRequestException('Email already in use');
    }

    //hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    //create user document and save in mongo
    await this.UserModel.create({
      name,
      email,
      password: hashedPassword,
    });
  }

  async login(credentials: LoginDto) {
    const { email, password } = credentials;

    //find if user exists by email
    const user = await this.UserModel.findOne({ email });
    if (!user) {
      throw new UnauthorizedException('Wrong email or password');
    }

    //compare entered password with existing password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Wrong email or password');
    }

    //generate jwt tokens
    const tokens = await this.generateUserToken(user._id);
    return { ...tokens, userId: user._id };
  }

  async refreshTokens(refreshToken: string) {
    const token = await this.RefreshTokenModel.findOne({
      token: refreshToken,
      expiryDate: { $gte: new Date() },
    });

    if (!token) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    return this.generateUserToken(token.userId);
  }

  async generateUserToken(userId) {
    const accessToken = this.jwtService.sign({ userId }, { expiresIn: '1h' });
    const refreshToken = uuidv4();

    await this.storeRefreshTokenAndAccessToken(
      refreshToken,
      accessToken,
      userId,
    );
    return { accessToken, refreshToken };
  }

  async storeRefreshTokenAndAccessToken(
    refreshToken: string,
    accessToken: string,
    userId: string,
  ) {
    //calculate expiry date 3 days from now
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 3);
    await this.RefreshTokenModel.updateOne(
      { userId },
      { $set: { expiryDate, refreshToken, accessToken } },
      { upsert: true },
    );
  }

  async logout(refreshToken: string) {
    // Find the refresh token in the database
    const token = await this.RefreshTokenModel.findOne({ token: refreshToken });

    if (!token) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Delete or invalidate the token
    await this.RefreshTokenModel.deleteOne({ token: refreshToken });
  }

  async changePassword(userId, oldPassword: string, newPassword: string) {
    //Find user
    const user = await this.UserModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    //compare the old and new password
    const passwordMatch = await bcrypt.compare(oldPassword, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Wrong old password');
    }

    //change user's password
    const newHashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = newHashedPassword;
    await user.save();
  }

  async getUser(userId) {
    const user = await this.UserModel.findById(userId).select('name email');
    return user;
  }
}
