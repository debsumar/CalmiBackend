import { ApiProperty } from '@nestjs/swagger';
import { Platform } from '../utils/constants';

/**
 * Swagger response model — mirrors the camelCase shape Drizzle returns
 * from a `select()` against the `waitlist` table.
 */
export class WaitlistEntity {
  @ApiProperty({
    format: 'uuid',
    description: 'Generated surrogate key. Clients never supply this.',
  })
  id!: string;

  @ApiProperty({ format: 'email' })
  email!: string;

  @ApiProperty({ format: 'date-time' })
  createdAt!: Date;

  @ApiProperty({
    format: 'uuid',
    nullable: true,
    type: String,
    description: 'Linked auth user, null while the sign-up is unclaimed',
  })
  userId!: string | null;

  @ApiProperty({
    enum: Platform,
    enumName: 'Platform',
    nullable: true,
    description:
      'Client platform the sign-up came from (1 = web). Null for legacy rows.',
  })
  platform!: Platform | null;

  @ApiProperty({
    description:
      'Whether the sign-up is active. Inactive rows are hidden from waiting/list by default.',
    example: true,
  })
  isActive!: boolean;
}

/**
 * Envelope returned by `POST /profile/waiting/list`.
 *
 * The rows live under `data`; `message` and `count` are there so a
 * client can show a confirmation without inspecting the array itself.
 */
export class WaitlistListResponseEntity {
  @ApiProperty({
    example: true,
    description: 'True whenever the request completed without an error',
  })
  success!: boolean;

  @ApiProperty({
    example: '3 waiting-list entries found.',
    description: 'Human-readable result summary, safe to surface in a UI',
  })
  message!: string;

  @ApiProperty({
    example: 3,
    description: 'Number of rows in `data` for this page',
  })
  count!: number;

  @ApiProperty({ type: [WaitlistEntity] })
  data!: WaitlistEntity[];
}

export class AddWaitlistResponseEntity {
  @ApiProperty({ example: true })
  success!: boolean;

  @ApiProperty({ example: 'Added to waiting list successfully.' })
  message!: string;

  @ApiProperty({ type: WaitlistEntity })
  data!: WaitlistEntity;
}
