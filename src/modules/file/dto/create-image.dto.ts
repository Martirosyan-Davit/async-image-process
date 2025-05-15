import { StringField } from '../../../decorators';

export class CreateImageDto {
  @StringField()
  prompt!: string;
}
