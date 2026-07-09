/** State for joining a gym via 6-character code. */
export interface GymLinkState {
  /** The 6-character code entered by the user (one char per slot). */
  code: string[];
  loading: boolean;
  error: string | null;
  success: boolean;
}
