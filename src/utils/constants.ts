/**
 * Shared application constants and enums.
 *
 * Keep this file free of framework imports so it can be used from any
 * layer (Drizzle schema, DTOs, services) without creating cycles.
 */

/**
 * Client platform a waiting-list sign-up (or any request) originated
 * from, stored as a small integer in `public.waitlist.platform`.
 *
 * Codes are part of the public API contract — never renumber an existing
 * member, only append new ones.
 */
export enum Platform {
  WEB = 1,
  ANDROID = 2,
  IOS = 3,
}
