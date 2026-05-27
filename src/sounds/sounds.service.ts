import { Injectable } from '@nestjs/common';
import type { Sound } from '../drizzle/schema';
import { FetchSoundsDto } from './dto/fetch-sounds.dto';
import { SoundsRepository } from './sounds.repository';

/**
 * Business-logic layer for sounds.
 *
 * Today this is a thin orchestrator over the repository. It is the
 * intentional home for things that are NOT data access:
 *   - access-control rules (e.g. hide premium sounds for free users)
 *   - response shaping / projection
 *   - cross-aggregate composition (e.g. join with favorites for a user)
 *   - cache layers, instrumentation, side-effects
 *
 * The controller talks to this layer; this layer talks to the repository.
 */
@Injectable()
export class SoundsService {
  constructor(private readonly soundsRepository: SoundsRepository) {}

  /**
   * Fetch the public sounds catalog using the validated query DTO.
   * Translates the DTO → repository options. No persistence concerns
   * here.
   */
  async fetchSounds(dto: FetchSoundsDto): Promise<Sound[]> {
    return this.soundsRepository.findAll({
      categoryId: dto.categoryId,
      featuredOnly: dto.featuredOnly,
      limit: dto.limit,
      offset: dto.offset,
    });
  }
}
