import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ListWaitlistDto } from './dto/list-waitlist.dto';
import { WaitlistEntity } from './profile.entity';
import { ProfileService } from './profile.service';

@ApiTags('profile')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  /**
   * POST /profile/waiting/list
   *
   * Returns waiting-list sign-ups. Filters and pagination are sent in
   * the JSON request body — easier for clients than building a query
   * string when filters grow over time.
   *
   * The endpoint is read-only despite the POST verb, so we override
   * the default 201 Created status and return 200 OK.
   */
  @Post('waiting/list')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    operationId: 'listWaitlist',
    summary: 'List waiting-list entries with optional filters in the body',
  })
  @ApiBody({ type: ListWaitlistDto, required: false })
  @ApiOkResponse({ type: [WaitlistEntity] })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  listWaitlist(@Body() body: ListWaitlistDto): Promise<WaitlistEntity[]> {
    return this.profileService.listWaitlist(body) as Promise<WaitlistEntity[]>;
  }
}
