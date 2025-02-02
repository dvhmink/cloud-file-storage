import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileService } from './file.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from 'src/guards/auth.guard';

@UseGuards(AuthGuard)
@Controller('file')
export class FileController {
  constructor(private readonly fileService: FileService) {}
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async UploadedFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          // new MaxFileSizeValidator({ maxSize: 1000 }),
          // new FileTypeValidator({ fileType: 'image/jpeg' }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Body('isPublic') isPublic: string,
    @Req() req,
  ) {
    // {
    //   const isPublicBool = isPublic === 'true' ? true : false;
    //   await this.fileService.upload(req.userId, file.originalname, file.buffer);
    // }
    const isPublicBool = isPublic === 'true';
    if (!file) {
      throw new BadRequestException('File is required');
    }

    const uploadedFile = await this.fileService.upload(
      req.userId,
      file.originalname,
      file,
      isPublicBool,
    );

    return {
      message: 'File uploaded successfully',
      file: uploadedFile,
    };
  }

  @Get('user-files')
  async getUserFiles(@Req() req) {
    return this.fileService.getFilesByUser(req.userId);
  }

  //TODO: download file

  // Delete a file by its ID
  @Delete(':fileId')
  async deleteFile(@Req() req, @Param('fileId') fileId: string) {
    return this.fileService.deleteFile(req.userId, fileId);
  }
}
