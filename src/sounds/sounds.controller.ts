import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FetchSoundsDto } from './dto/fetch-sounds.dto';
import { SoundEntity } from './sounds.entity';
import { SoundsService } from './sounds.service';

@ApiTags('sounds')
@Controller('sounds')
export class SoundsController {
  constructor(private readonly soundsService: SoundsService) {}

  /**
   * POST /sounds/fetch
   *
   * Returns the sounds catalog. Filters and pagination are sent in
   * the JSON request body — easier for clients than building a query
   * string when filters grow over time.
   *
   * The endpoint is read-only despite the POST verb, so we override
   * the default 201 Created status and return 200 OK.
   */
  @Post('fetch')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    operationId: 'fetchSounds',
    summary: 'Fetch sounds with optional filters in the request body',
  })
  @ApiBody({ type: FetchSoundsDto, required: false })
  @ApiOkResponse({ type: [SoundEntity] })
  fetchSounds(@Body() body: FetchSoundsDto): Promise<SoundEntity[]> {
    return this.soundsService.fetchSounds(body) as Promise<SoundEntity[]>;
  }
}
