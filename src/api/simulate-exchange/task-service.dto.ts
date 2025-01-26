import { TaskPayload } from '../../core/types';
import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class TaskServiceDto implements TaskPayload{
  @IsString()
  @IsNotEmpty()
  baseCurrency!: string;

  @IsString()
  @IsNotEmpty()
  targetCurrency!: string;

  @IsNumber()
  @IsNotEmpty()
  amount!: number;

  @IsNumber()
  @IsOptional()
  conversionRate?: number;
}
