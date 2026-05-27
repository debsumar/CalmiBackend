import { Module } from '@nestjs/common';
import { SoundsController } from './sounds.controller';
import { SoundsRepository } from './sounds.repository';
import { SoundsService } from './sounds.service';

@Module({
  controllers: [SoundsController],
  providers: [SoundsService, SoundsRepository],
})
export class SoundsModule {}
