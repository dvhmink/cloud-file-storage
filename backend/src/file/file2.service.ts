import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3';
import { Model } from 'mongoose';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import { InjectModel } from '@nestjs/mongoose';
import { File } from './schemas/file.schema';

@Injectable()
export class File2Service {
  private client: S3Client;
  private bucketName = this.configService.get('AWS_S3_BUCKET_NAME');

  constructor(
    private readonly configService: ConfigService,
    @InjectModel(File.name) private fileModel: Model<File>,
  ) {
    const s3_region = this.configService.get('AWS_S3_REGION');

    if (!s3_region) {
      Logger.log('S3_REGION not found in environment variables');
      throw new Error('S3_REGION not found in environment variables');
    }

    this.client = new S3Client({
      region: s3_region,
      credentials: {
        accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
      },
      forcePathStyle: true,
    });
  }

  async uploadSingleFile(
    userId: string,
    file,
    fileName: string,
    isPublic = true,
  ) {
    try {
      const key = `${uuidv4()}`;
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: isPublic ? 'public-read' : 'private',

        Metadata: {
          originalName: file.originalname,
        },
      });

      const uploadResult = await this.client.send(command);

      if (uploadResult.$metadata.httpStatusCode === 200) {
        // Logger.log(file);
        const newFile = new this.fileModel({
          key,
          name: fileName,
          type: file.mimetype,
          size: file.size,
          uploadedBy: userId,
        });
        await newFile.save();
      } else {
        Logger.log('upload to DB failed');
      }

      return {
        url: isPublic
          ? (await this.getFileUrl(key)).url
          : (await this.getPresignedSignedUrl(key, file.mimetype, isPublic))
              .url,
        key,
        isPublic,
        uploadResult,
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getFileUrl(key: string) {
    return { url: `https://${this.bucketName}.s3.amazonaws.com/${key}` };
  }

  async getPresignedSignedUrl(
    key: string,
    contentType: string,
    isPublic: boolean,
  ) {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        ContentType: contentType,
        ACL: isPublic ? 'public-read' : 'private',
      });

      const url = await getSignedUrl(this.client, command, {
        expiresIn: 60 * 60 * 24, // 24 hours
      });

      return { url };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async deleteFile(userId: string, key: string) {
    //find and delete record in mongodb
    const file = await this.fileModel.findOne({
      key,
      uploadedBy: userId,
    });
    if (!file) {
      throw new NotFoundException('File not found or access denied');
    } else {
      await this.fileModel.deleteOne({ key });
    }

    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.client.send(command);

      return { message: 'File deleted successfully' };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  // async listFiles(prefix?: string, maxKeys?: string) {
  //   try {
  //     const params = {
  //       Bucket: this.bucketName,
  //       Prefix: prefix || '', // Optional folder prefix
  //       MaxKeys: maxKeys ? parseInt(maxKeys, 10) : 1000, // Max number of files to retrieve
  //     };

  //     const command = new ListObjectsV2Command(params);
  //     const response = await this.client.send(command);

  //     return {
  //       message: 'Files retrieved successfully',
  //       files: response.Contents || [],
  //     };
  //   } catch (error) {
  //     throw new Error(`Error listing files: ${error.message}`);
  //   }
  // }

  //lấy object s3 của người dùng trong DB
  async listFiles(userId: string) {
    try {
      // Find all files where the `uploadedBy` matches the provided userId
      const files = await this.fileModel.find({ uploadedBy: userId }).exec();

      // Map the file objects to a more user-friendly structure (if needed)
      const formattedFiles = files.map((file) => ({
        id: file._id,
        key: file.key,
        name: file.name,
        size: file.size,
        type: file.type,
        // uploadedAt: file.createdAt, // File upload time
      }));

      return formattedFiles;
    } catch (error) {
      Logger.error('Error fetching file list', error);
      throw new InternalServerErrorException('Failed to fetch file list');
    }
  }
}
