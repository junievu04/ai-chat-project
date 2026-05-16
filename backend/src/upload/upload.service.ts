import { Injectable, BadRequestException } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';

@Injectable()
export class UploadService {
  constructor(private cloudinaryService: CloudinaryService) {}

  async uploadFile(file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file provided');

    const { originalname, buffer, mimetype } = file;
    const { url, publicId } = await this.cloudinaryService.uploadBuffer(
      buffer,
      originalname,
      mimetype,
    );

    const type = mimetype.startsWith('image/')
      ? 'image'
      : mimetype === 'application/pdf'
        ? 'pdf'
        : 'file';

    return { url, publicId, type, name: originalname };
  }
}
