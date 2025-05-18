import { Injectable } from '@nestjs/common';
import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';

import { ApiConfigService } from '../../shared/services/api-config.service';

@Injectable()
export class FileService {
  private readonly img2imgEndpoint: string;

  private readonly extraImageEndpoint: string;

  constructor(private readonly apiConfigService: ApiConfigService) {
    this.img2imgEndpoint = `${this.apiConfigService.sdConfig.url}/sdapi/v1/img2img`;
    this.extraImageEndpoint = `${this.apiConfigService.sdConfig.url}/sdapi/v1/extra-single-image`;
  }

  async processImageByPrompt(prompt: string) {
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

      const initImageBase64 = await fs.readFile(initImagePath, {
        encoding: 'base64',
      });
      const controlImageBase64 = await fs.readFile(controlImagePath, {
        encoding: 'base64',
      });

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

      const response = await axios.post(this.img2imgEndpoint, payload);
      const base64Image = response.data.images[0];

      const pixelPayload = {
        pixelization: true,
        pixelization_value: 2,
        pixelization_keep_res: true,
        image: base64Image,
      };

      const pixelResponse = await axios.post(
        this.extraImageEndpoint,
        pixelPayload,
      );
      const pixelImageBase64 = pixelResponse.data.image;

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const buffer = Buffer.from(pixelImageBase64, 'base64');

      const processedBuffer = await sharp(buffer)
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
      const filePath = path.join('static', 'animations', filename);
      await fs.writeFile(filePath, finalImageBuffer);

      return filePath;
    } catch (error) {
      console.warn(error);

      return null;
    }
  }
}
