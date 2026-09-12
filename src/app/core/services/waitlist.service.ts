import { Injectable, inject } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

export interface WaitlistResponse {
  success: boolean;
  message?: string;
}

@Injectable({ providedIn: 'root' })
export class WaitlistService {
  private authService = inject(AuthService, { optional: true });
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = this.authService?.client ?? createClient(environment.supabaseUrl, environment.supabaseKey);
  }

  /**
   * Registers an email on the Supabase waitlist table.
   *
   * @param email User's email address
   * @param honeypot Value of the hidden decoy field. Real users leave it empty;
   *                 a non-empty value drops submission silently to thwart bots.
   * @param name Optional user full name
   */
  async join(email: string, honeypot = '', name = ''): Promise<WaitlistResponse> {
    if (honeypot && honeypot.trim() !== '') {
      // Honeypot caught bot - return success without writing to DB
      return { success: true, message: "You're on the list." };
    }

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      return { success: false, message: 'Please enter a valid email address.' };
    }

    try {
      const currentUserId = this.authService?.currentUser()?.id ?? null;

      const record: { email: string; name?: string; user_id?: string | null } = {
        email: trimmedEmail,
      };

      if (name && name.trim()) {
        record.name = name.trim();
      }

      if (currentUserId) {
        record.user_id = currentUserId;
      }

      const client = this.authService?.client ?? this.supabase;
      const { error } = await client
        .from('waitlist')
        .insert([record]);

      if (error) {
        // Handle unique constraint (already on waitlist)
        if (error.code === '23505') {
          return { success: true, message: "You're already on the waitlist! We'll email you when Calmi opens up." };
        }
        console.error('Failed to join waitlist in Supabase:', error);
        return {
          success: false,
          message: error.message || "We couldn't add you right now. Please try again.",
        };
      }

      return {
        success: true,
        message: "You're on the list. We'll email you when Calmi opens up.",
      };
    } catch (err: unknown) {
      console.error('Waitlist join exception:', err);
      const msg = err instanceof Error ? err.message : "We couldn't add you right now. Please try again.";
      return { success: false, message: msg };
    }
  }
}
