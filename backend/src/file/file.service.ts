import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { File } from './schemas/file.schema';
import { v4 as uuidv4 } from 'uuid';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class FileService {
  private readonly s3Client = new S3Client({
    region: this.configService.getOrThrow('AWS_S3_REGION'),
  });

  constructor(
    private readonly configService: ConfigService,
    @InjectModel(File.name) private fileModel: Model<File>,
  ) {}

  async upload(
    userId: string,
    fileName: string,
    file: Express.Multer.File,
    isPublic: boolean,
  ) {
    try {
      const key = `${uuidv4()}`;
      const command = new PutObjectCommand({
        Bucket: 'minknestjs',
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read',
        Metadata: {
          originalName: file.originalname,
        },
      });
      const uploadResult = await this.s3Client.send(command);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }

    // Logger.log(uploadResult);

    // Step 2: Save the file metadata to MongoDB
    const newFile = new this.fileModel({
      key: fileName,
      url: `https://minknestjs.s3.${this.configService.getOrThrow('AWS_S3_REGION')}.amazonaws.com/${fileName}`,
      name: fileName,
      size: file.size,
      uploadedBy: userId,
    });

    await newFile.save();

    return newFile;
  }

  // Get all files uploaded by a specific user
  async getFilesByUser(userId: string) {
    return this.fileModel.find({ uploadedBy: userId }).exec();
  }

  //TODO: Download a file from S3

  // Delete a file from S3 and MongoDB
  async deleteFile(userId: string, fileId: string) {
    // Step 1: Find the file in MongoDB
    const file = await this.fileModel.findOne({
      _id: fileId,
      uploadedBy: userId,
    });
    if (!file) {
      throw new Error('File not found or access denied');
    }

    // Step 2: Delete the file from S3
    const command = new DeleteObjectCommand({
      Bucket: this.configService.getOrThrow('AWS_S3_BUCKET_NAME'),
      Key: file.key,
    });
    await this.s3Client.send(command);

    // Step 3: Delete the file metadata from MongoDB
    await this.fileModel.deleteOne({ _id: fileId });
    return { message: 'File deleted successfully' };
  }
}
