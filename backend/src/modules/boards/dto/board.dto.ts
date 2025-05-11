import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateBoardDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class UpdateBoardDto {
  @IsOptional()
  @IsString()
  name?: string;
}
