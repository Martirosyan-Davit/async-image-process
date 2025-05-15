import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as fs from 'fs/promises';
import path from 'path';
import { lastValueFrom, Observable } from 'rxjs';
import sharp from 'sharp';
import { transparentBackground } from 'transparent-background';
import { v4 as uuidv4 } from 'uuid';

import { ApiConfigService } from '../../../shared/services/api-config.service';

@Injectable()
export class ImageProcessService {
  private readonly sdApiUrl: string;

  private readonly logger = new Logger(ImageProcessService.name);

  private readonly staticDir: string;

  constructor(
    private readonly apiConfigService: ApiConfigService,
    private readonly httpService: HttpService,
  ) {
    this.sdApiUrl = this.apiConfigService.sdConfig.url;
    this.staticDir = path.join(process.cwd(), 'static');
  }

  // Process image asynchronously with a prompt
  async process(prompt: string): Promise<string | null> {
    try {
      // Generate the image via Stable Diffusion API
      const base64Image = await this.generateImage(prompt);

      if (!base64Image) {
        return null;
      }

      // Process the image to make it pixelated with transparent background
      return this.processImage(base64Image);
    } catch (error) {
      this.logger.error('Error in image processing', error);

      return null;
    }
  }

  // Step 1: Generate image from SD API
  private async generateImage(prompt: string): Promise<string | null> {
    try {
      const initImagePath = path.join(
        process.cwd(),
        'static',
        'animations',
        'character_base.png',
      );
      const controlImagePath = path.join(
        process.cwd(),
        'static',
        'animations',
        'character_bones.png',
      );

      const initImageBase64 = await fs.readFile(initImagePath, 'base64');
      const controlImageBase64 = await fs.readFile(controlImagePath, 'base64');

      const payload = {
        prompt,
        negative_prompt: 'EasyNegative, watermark, text',
        steps: 25,
        width: 848,
        height: 1600,
        sampler_name: 'Euler a',
        cfg_scale: 10,
        denoising_strength: 0.75,
        init_images: [initImageBase64],
        alwayson_scripts: {
          controlnet: {
            args: [
              {
                enabled: true,
                image: controlImageBase64,
                module: 'none',
                model: 'controlnetxlCNXL_2vxpswa7OpenposeV21 [0d95a9db]',
                weight: 1,
                resize_mode: 'Crop and Resize',
                processor_res: 1600,
                threshold_a: 0.5,
                threshold_b: 0.5,
                guidance_start: 0,
                guidance_end: 1,
                control_mode: 'ControlNet is more important',
                pixel_perfect: false,
              },
            ],
          },
        },
      };

      const response = await axios.post(
        `${this.sdApiUrl}/sdapi/v1/img2img`,
        payload,
      );

      console.log(response.data.images[0]);

      return response.data.images[0];
    } catch (error) {
      this.logger.error('Error generating image from SD API', error);

      return null;
    }
  }

  // Step 2: Apply pixelization effect
  private async applyPixelization(base64Image: string): Promise<string | null> {
    try {
      const pixelPayload = {
        pixelization: true,
        pixelization_value: 2,
        pixelization_keep_res: true,
        image: base64Image,
      };

      const pixelResponse = await axios.post(
        `${this.sdApiUrl}/sdapi/v1/extra-single-image`,
        pixelPayload,
      );

      return pixelResponse.data.image;
    } catch (error) {
      this.logger.error('Error applying pixelization', error);

      return null;
    }
  }

  // Step 3: Process the image with background removal and transparency
  private async processImage(base64Image: string): Promise<string | null> {
    try {
      // Apply pixelization first
      const pixelImageBase64 = await this.applyPixelization(base64Image);

      if (!pixelImageBase64) {
        return null;
      }

      const buffer = Buffer.from(pixelImageBase64, 'base64');
      const bufferWithoutBackground = await transparentBackground(
        buffer,
        'png',
        { fast: false },
      );

      const processedBuffer = await sharp(bufferWithoutBackground)
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });

      const { data, info } = processedBuffer;
      const transparentPixels = Buffer.alloc(data.length);

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];

        if (r > 240 && g > 240 && b > 240) {
          transparentPixels[i] = 255;
          transparentPixels[i + 1] = 255;
          transparentPixels[i + 2] = 255;
          transparentPixels[i + 3] = 0;
        } else {
          transparentPixels[i] = r;
          transparentPixels[i + 1] = g;
          transparentPixels[i + 2] = b;
          transparentPixels[i + 3] = a;
        }
      }

      const finalImageBuffer = await sharp(transparentPixels, {
        raw: {
          width: info.width,
          height: info.height,
          channels: 4,
        },
      })
        .png()
        .toBuffer();

      const filename = `animation_${uuidv4()}.png`;
      const animationsDir = path.join(this.staticDir, 'animations');

      // Ensure directory exists
      await fs.mkdir(animationsDir, { recursive: true });

      const filePath = path.join(animationsDir, filename);
      await fs.writeFile(filePath, finalImageBuffer);

      // Return the path that can be used to access the image
      return path.join('/static/animations', filename);
    } catch (error) {
      this.logger.error('Error processing image', error);

      return null;
    }
  }
}
