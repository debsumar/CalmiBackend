import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Public } from '../auth/public.decorator';
import { AddWaitlistDto } from './dto/add-waitlist.dto';
import { ListWaitlistDto } from './dto/list-waitlist.dto';
import {
  AddWaitlistResponseEntity,
  WaitlistListResponseEntity,
} from './profile.entity';
import { ProfileService } from './profile.service';

@ApiTags('profile')
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
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    operationId: 'listWaitlist',
    summary: 'List waiting-list entries with optional filters in the body',
  })
  @ApiBody({ type: ListWaitlistDto, required: false })
  @ApiOkResponse({ type: WaitlistListResponseEntity })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  listWaitlist(
    @Body() body: ListWaitlistDto,
  ): Promise<WaitlistListResponseEntity> {
    return this.profileService.listWaitlist(body);
  }

  /**
   * POST /profile/waiting/add
   *
   * PUBLIC — no JWT. This is how an anonymous visitor joins the waiting
   * list to be invited later, so requiring a login would defeat the
   * purpose. Every other route on this controller stays authenticated.
   *
   * Because it is both public and a write, it carries a much tighter
   * rate limit than the global default: 5 sign-ups per minute per IP.
   */
  @Public()
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  @Post('waiting/add')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    operationId: 'addToWaitlist',
    summary: 'Join the waiting list (public, no authentication required)',
  })
  @ApiBody({ type: AddWaitlistDto })
  @ApiCreatedResponse({ type: AddWaitlistResponseEntity })
  @ApiConflictResponse({ description: 'Email is already on the waiting list.' })
  @ApiBadRequestResponse({
    description: 'Validation failed (bad email, or platform not 1/2/3).',
  })
  @ApiTooManyRequestsResponse({
    description: 'Rate limit exceeded — max 5 sign-ups per minute per IP.',
  })
  addToWaitlist(
    @Body() body: AddWaitlistDto,
  ): Promise<AddWaitlistResponseEntity> {
    return this.profileService.addToWaitlist(body);
  }
}
