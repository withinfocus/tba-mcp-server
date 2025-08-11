export const TEST_TEAMS = {
  TEAM_RESISTANCE: 'frc86',
  CHEESY_POOFS: 'frc254',
  ROBONAUTS: 'frc148',
} as const;

export const TEST_YEARS = {
  RECENT: 2023,
  CURRENT: new Date().getFullYear(),
  FIRST: 1992,
  CHAMPIONSHIP_2019: 2019,
} as const;

export const KNOWN_EVENTS = {
  '2023': ['2023casj', '2023casd', '2023cala', '2023week0'],
  '2019': ['2019week0', '2019arc', '2019cur', '2019dal'],
} as const;

export const KNOWN_DISTRICTS = {
  '2023': ['2023fim', '2023fma', '2023fin', '2023ne'],
} as const;

export interface TestEvent {
  key: string;
  expectedTeams?: number;
  expectedMatches?: number;
  hasPlayoffs?: boolean;
}

export const CHAMPIONSHIP_EVENTS: TestEvent[] = [
  {
    key: '2023hop',
    expectedTeams: 68,
    hasPlayoffs: true,
  },
  {
    key: '2023gal',
    expectedTeams: 68,
    hasPlayoffs: true,
  },
];

export function generateTestTeamKey(teamNumber: number): string {
  return `frc${teamNumber}`;
}

export function generateTestEventKey(year: number, code: string): string {
  return `${year}${code}`;
}

export function generateTestMatchKey(
  eventKey: string,
  compLevel: string,
  matchNumber: number,
): string {
  return `${eventKey}_${compLevel}${matchNumber}`;
}

export function isValidTeamKey(key: string): boolean {
  return /^frc\d+$/.test(key);
}

export function isValidEventKey(key: string): boolean {
  return /^\d{4}[a-z]+$/.test(key);
}

export function isValidMatchKey(key: string): boolean {
  return /^\d{4}[a-z]+_(qm|sf|f)\d+m?\d*$/.test(key);
}

export function extractTeamNumber(teamKey: string): number {
  const match = teamKey.match(/^frc(\d+)$/);
  return match ? parseInt(match[1] || '0', 10) : -1;
}

export function extractYear(eventKey: string): number {
  const match = eventKey.match(/^(\d{4})/);
  return match ? parseInt(match[1] || '0', 10) : -1;
}
