export type UploadPresignedUrlRequest = {
  fileName: string;
  fileType: string;
};

export type PresignedUrlResponse = {
  url: string;
};
