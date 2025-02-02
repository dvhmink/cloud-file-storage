import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { User } from 'src/auth/schemas/user.schema';
import mongoose from 'mongoose';

@Schema({ timestamps: true })
export class File extends Document {
  @Prop({ required: true })
  key: string; // The unique key used in S3 for the file

  @Prop({ required: false })
  url: string; // The URL of the file in S3

  @Prop({ required: true })
  name: string; // The original name of the file

  @Prop()
  size: number; // Size of the file in bytes

  @Prop()
  type: string; // MIME type of the file

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  uploadedBy: User; // Reference to the user who uploaded the file
}

export const FileSchema = SchemaFactory.createForClass(File);
