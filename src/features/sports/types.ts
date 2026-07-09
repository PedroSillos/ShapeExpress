/** A single sport option displayed in the selection grid and manage list. */
export interface SportOption {
  /** Matches the string values used in welcome-answers.sports and UserProfile.specialties */
  id: string;
  label: string;
  /** SVG asset URL imported via Vite */
  icon: string;
  /** Solid hex background color for the icon card */
  bg: string;
}
