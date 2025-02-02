import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  HttpCode,
  HttpStatus,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Post,
  Query,
  Req,
  Res,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { File2Service } from './file2.service';
import { AuthGuard } from 'src/guards/auth.guard';

@UseGuards(AuthGuard)
@Controller('file')
export class File2Controller {
  constructor(private readonly file2Service: File2Service) {}

  @Post('/upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          // new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
          // new MaxFileSizeValidator({
          //   maxSize: MAX_FILE_SIZE, // 10MB
          //   message: 'File is too large. Max file size is 10MB',
          // }),
        ],
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File,
    @Req() req,
    @Body('isPublic') isPublic: string,
  ) {
    const isPublicBool = isPublic === 'true' ? true : false;
    return this.file2Service.uploadSingleFile(
      req.userId,
      file,
      file.originalname,
      isPublicBool,
    );
  }

  // @Get('/list')
  // async listFiles(
  //   @Query('prefix') prefix: string,
  //   @Query('maxKeys') maxKeys: string,
  // ) {
  //   return this.file2Service.listFiles(prefix, maxKeys);
  // }

  //lấy object s3 của người dùng trong DB
  @Get('list')
  async listFiles(@Req() req) {
    return this.file2Service.listFiles(req.userId);
  }

  @Get(':key')
  async getFileUrl(@Param('key') key: string) {
    return this.file2Service.getFileUrl(key);
  }

  @Get('/signed-url/:key')
  async getSingedUrl(
    @Param('key')
    @Param('contentType')
    @Param('isPublic')
    key: string,
    contentType: string,
    isPublic: boolean,
  ) {
    return this.file2Service.getPresignedSignedUrl(key, contentType, isPublic);
  }

  @Delete(':key')
  async deleteFile(@Req() req, @Param('key') key: string) {
    return this.file2Service.deleteFile(req.userId, key);
  }
}
