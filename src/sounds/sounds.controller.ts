import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FetchSoundsDto } from './dto/fetch-sounds.dto';
import { SoundEntity } from './sounds.entity';
import { SoundsService } from './sounds.service';

@ApiTags('sounds')
@Controller('sounds')
export class SoundsController {
  constructor(private readonly soundsService: SoundsService) {}

  /**
   * GET /sounds
   *
   * Returns the full sounds catalog. Supports optional filtering by
   * sound_categories.id, featured-only flag, plus limit/offset pagination.
   */
  @Get()
  @ApiOperation({
    operationId: 'fetchSounds',
    summary: 'Fetch sounds, optionally filtered by category',
  })
  @ApiOkResponse({ type: [SoundEntity] })
  fetchSounds(@Query() query: FetchSoundsDto): Promise<SoundEntity[]> {
    return this.soundsService.fetchSounds(query) as Promise<SoundEntity[]>;
  }
}
