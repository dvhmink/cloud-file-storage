import { Module } from '@nestjs/common';
import { FileService } from './file.service';
import { FileController } from './file.controller';
import { FileSchema } from './schemas/file.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { File2Controller } from './file2.controller';
import { File2Service } from './file2.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: File.name, schema: FileSchema }]),
  ],
  controllers: [File2Controller],
  providers: [File2Service],
})
export class FileModule {}
