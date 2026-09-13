import { ApiProperty } from '@nestjs/swagger';

/**
 * Swagger response model — mirrors the camelCase shape Drizzle returns
 * from a `select()` against the `waitlist` table.
 */
export class WaitlistEntity {
  @ApiProperty({ nullable: true, type: String })
  name!: string | null;

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
}
