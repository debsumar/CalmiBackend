import { BadRequestException, ConflictException } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import type { Waitlist } from '../drizzle/schema';
import { Platform } from '../utils/constants';
import { AddWaitlistDto } from './dto/add-waitlist.dto';
import { ListWaitlistDto } from './dto/list-waitlist.dto';
import { ProfileRepository } from './profile.repository';
import { ProfileService } from './profile.service';

/**
 * Unit tests for the add-to-waiting-list path. The repository is mocked,
 * so these cover the service's own rules: email normalisation, the
 * platform-0 edge case, and driver-error → HTTP-exception mapping.
 */
describe('ProfileService.addToWaitlist', () => {
  let service: ProfileService;
  let insertWaitlist: jest.Mock;
  let findWaitlist: jest.Mock;

  const row: Waitlist = {
    id: '9f1c2b7e-4a3d-4f8e-9c1a-2b7e4a3d4f8e',
    email: 'someone@example.com',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    userId: null,
    platform: Platform.WEB,
    isActive: true,
  };

  beforeEach(async () => {
    insertWaitlist = jest.fn().mockResolvedValue(row);
    findWaitlist = jest.fn().mockResolvedValue([row]);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfileService,
        {
          provide: ProfileRepository,
          useValue: { insertWaitlist, findWaitlist },
        },
      ],
    }).compile();

    service = module.get(ProfileService);
  });

  const dto = (over: Partial<AddWaitlistDto> = {}): AddWaitlistDto =>
    Object.assign(new AddWaitlistDto(), { email: 'someone@example.com' }, over);

  it('returns the success envelope with the exact message', async () => {
    const result = await service.addToWaitlist(dto());

    expect(result).toEqual({
      success: true,
      message: 'Added to waiting list successfully.',
      data: row,
    });
  });

  it('lower-cases the email before insert', async () => {
    await service.addToWaitlist(dto({ email: 'SoMeOne@Example.COM' }));

    expect(insertWaitlist).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'someone@example.com' }),
    );
  });

  it('forwards the platform code to the repository', async () => {
    await service.addToWaitlist(dto({ platform: Platform.WEB }));

    expect(insertWaitlist).toHaveBeenCalledWith(
      expect.objectContaining({ platform: Platform.WEB }),
    );
  });

  // The service guards platform with `!== undefined` rather than a
  // truthiness check, so a future enum member with code 0 still reaches
  // the repository instead of being silently dropped.
  it('omits platform when not supplied, and never sends id or userId', async () => {
    await service.addToWaitlist(dto());

    expect(insertWaitlist).toHaveBeenCalledWith({
      email: 'someone@example.com',
    });
  });

  // Drizzle wraps driver errors: the PG code sits on `cause`, not on the
  // thrown object. These mocks mirror that real shape — mocking a bare
  // `{ code }` is what let a 500 slip past this suite before.
  const wrapped = (code: string) =>
    Object.assign(new Error(`Failed query (${code})`), {
      cause: Object.assign(new Error('PostgresError'), { code }),
    });

  it('maps a wrapped 23505 unique violation to 409 Conflict', async () => {
    insertWaitlist.mockRejectedValue(wrapped('23505'));

    await expect(service.addToWaitlist(dto())).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it('maps a wrapped 23503 foreign-key violation to 400 Bad Request', async () => {
    insertWaitlist.mockRejectedValue(wrapped('23503'));

    await expect(service.addToWaitlist(dto())).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('still maps an unwrapped 23505 (driver throwing raw)', async () => {
    insertWaitlist.mockRejectedValue({ code: '23505' });

    await expect(service.addToWaitlist(dto())).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it('rethrows unrecognised driver errors untouched', async () => {
    const boom = new Error('connection reset');
    insertWaitlist.mockRejectedValue(boom);

    await expect(service.addToWaitlist(dto())).rejects.toBe(boom);
  });

  it('rethrows a wrapped error whose code is not mapped', async () => {
    const boom = wrapped('28P01');
    insertWaitlist.mockRejectedValue(boom);

    await expect(service.addToWaitlist(dto())).rejects.toBe(boom);
  });
});

describe('ProfileService.listWaitlist', () => {
  let service: ProfileService;
  let findWaitlist: jest.Mock;

  beforeEach(async () => {
    findWaitlist = jest.fn().mockResolvedValue([]);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfileService,
        {
          provide: ProfileRepository,
          useValue: { findWaitlist, insertWaitlist: jest.fn() },
        },
      ],
    }).compile();

    service = module.get(ProfileService);
  });

  it('filters to active rows only when isActive is not supplied', async () => {
    await service.listWaitlist(new ListWaitlistDto());

    expect(findWaitlist).toHaveBeenCalledWith(
      expect.objectContaining({ isActive: true }),
    );
  });

  it('honours an explicit isActive false for inspecting inactive rows', async () => {
    await service.listWaitlist(
      Object.assign(new ListWaitlistDto(), { isActive: false }),
    );

    expect(findWaitlist).toHaveBeenCalledWith(
      expect.objectContaining({ isActive: false }),
    );
  });
});
