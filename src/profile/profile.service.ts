import { Injectable } from '@nestjs/common';
import type { Waitlist } from '../drizzle/schema';
import { ListWaitlistDto } from './dto/list-waitlist.dto';
import { ProfileRepository } from './profile.repository';

/**
 * Business-logic layer for profile / waiting-list concerns.
 *
 * Today this is a thin orchestrator over the repository. It is the
 * intentional home for things that are NOT data access:
 *   - access-control rules (e.g. admin-only visibility of emails)
 *   - response shaping / PII masking
 *   - cross-aggregate composition (e.g. join with users)
 *   - cache layers, instrumentation, side-effects
 *
 * The controller talks to this layer; this layer talks to the repository.
 */
@Injectable()
export class ProfileService {
  constructor(private readonly profileRepository: ProfileRepository) {}

  /**
   * List waiting-list entries using the validated body DTO.
   * Translates the DTO → repository options. No persistence concerns
   * here.
   */
  async listWaitlist(dto: ListWaitlistDto): Promise<Waitlist[]> {
    return this.profileRepository.findWaitlist({
      email: dto.email,
      userId: dto.userId,
      limit: dto.limit,
      offset: dto.offset,
    });
  }
}
