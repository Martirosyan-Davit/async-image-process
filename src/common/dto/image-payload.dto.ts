import { StringField } from '../../decorators';
import { BaseDto } from './base.dto';

export class ImagePayloadDto extends BaseDto {
  @StringField()
  imagePath!: string;
}
