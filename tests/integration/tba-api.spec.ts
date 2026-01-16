import { expect } from '@playwright/test';
import { test, createAndInitializeMCPClient } from './setup.js';
import { MCPClient } from './mcp-client.js';

test.describe('TBA API Integration Tests', () => {
  let mcpClient: MCPClient;

  test.beforeEach(async () => {
    mcpClient = await createAndInitializeMCPClient();
  });

  test.afterEach(async () => {
    await mcpClient.stop();
  });

  test.describe('Team Operations', () => {
    test('should get team information', async () => {
      const result = await mcpClient.callTool('get_team', {
        team_key: 'frc86',
      });

      expect(result.content).toBeInstanceOf(Array);
      expect(result.content[0]?.type).toBe('text');

      const teamData = JSON.parse(result.content[0]?.text || '');
      expect(teamData).toMatchObject({
        key: 'frc86',
        team_number: 86,
        name: expect.any(String),
      });
    });

    test('should get team events for a year', async () => {
      const result = await mcpClient.callTool('get_team_events', {
        team_key: 'frc86',
        year: 2023,
      });

      expect(result.content).toBeInstanceOf(Array);
      expect(result.content[0]?.type).toBe('text');

      const events = JSON.parse(result.content[0]?.text || '');
      expect(events).toBeInstanceOf(Array);

      if (events.length > 0) {
        expect(events[0]).toMatchObject({
          key: expect.stringMatching(/^2023/),
          name: expect.any(String),
          year: 2023,
        });
      }
    });

    test('should get team awards for a year', async () => {
      const result = await mcpClient.callTool('get_team_awards', {
        team_key: 'frc86',
        year: 2023,
      });

      expect(result.content).toBeInstanceOf(Array);
      expect(result.content[0]?.type).toBe('text');

      const awards = JSON.parse(result.content[0]?.text || '');
      expect(awards).toBeInstanceOf(Array);
    });

    test('should get team matches for a year', async () => {
      const result = await mcpClient.callTool('get_team_matches', {
        team_key: 'frc86',
        year: 2023,
      });

      expect(result.content).toBeInstanceOf(Array);
      expect(result.content[0]?.type).toBe('text');

      const matches = JSON.parse(result.content[0]?.text || '');
      expect(matches).toBeInstanceOf(Array);
    });

    test('should validate team key format', async () => {
      await expect(
        mcpClient.callTool('get_team', {
          team_key: 'invalid_key',
        }),
      ).rejects.toThrow();
    });

    test('should get team years participated', async () => {
      const result = await mcpClient.callTool('get_team_years_participated', {
        team_key: 'frc86',
      });

      expect(result.content).toBeInstanceOf(Array);
      const years = JSON.parse(result.content[0]?.text || '');
      expect(years).toBeInstanceOf(Array);
      expect(years.every((year: number) => typeof year === 'number')).toBe(
        true,
      );
    });

    test('should get team districts', async () => {
      const result = await mcpClient.callTool('get_team_districts', {
        team_key: 'frc86',
      });

      expect(result.content).toBeInstanceOf(Array);
      const districts = JSON.parse(result.content[0]?.text || '');
      expect(districts).toBeInstanceOf(Array);
    });

    test('should get team robots', async () => {
      const result = await mcpClient.callTool('get_team_robots', {
        team_key: 'frc86',
      });

      expect(result.content).toBeInstanceOf(Array);
      const robots = JSON.parse(result.content[0]?.text || '');
      expect(robots).toBeInstanceOf(Array);
    });
  });

  test.describe('Event Operations', () => {
    test('should get events for a year', async () => {
      const result = await mcpClient.callTool('get_events', {
        year: 2023,
      });

      expect(result.content).toBeInstanceOf(Array);
      const events = JSON.parse(result.content[0]?.text || '');
      expect(events).toBeInstanceOf(Array);
      expect(events.length).toBeGreaterThan(0);

      expect(events[0]).toMatchObject({
        key: expect.stringMatching(/^2023/),
        name: expect.any(String),
        year: 2023,
      });
    });

    test('should get specific event information', async () => {
      const eventsResult = await mcpClient.callTool('get_events', {
        year: 2023,
      });
      const events = JSON.parse(eventsResult.content[0]?.text || '');

      if (events.length > 0) {
        const eventKey = events[0].key;

        const result = await mcpClient.callTool('get_event', {
          event_key: eventKey,
        });

        expect(result.content).toBeInstanceOf(Array);
        const eventData = JSON.parse(result.content[0]?.text || '');
        expect(eventData).toMatchObject({
          key: eventKey,
          name: expect.any(String),
          year: 2023,
        });
      }
    });

    test('should get event teams', async () => {
      const eventsResult = await mcpClient.callTool('get_events', {
        year: 2023,
      });
      const events = JSON.parse(eventsResult.content[0]?.text || '');

      if (events.length > 0) {
        const eventKey = events[0].key;

        const result = await mcpClient.callTool('get_event_teams', {
          event_key: eventKey,
        });

        expect(result.content).toBeInstanceOf(Array);
        const teams = JSON.parse(result.content[0]?.text || '');
        expect(teams).toBeInstanceOf(Array);
      }
    });

    test('should get event rankings', async () => {
      const eventsResult = await mcpClient.callTool('get_events', {
        year: 2023,
      });
      const events = JSON.parse(eventsResult.content[0]?.text || '');

      if (events.length > 0) {
        const eventKey = events[0].key;

        const result = await mcpClient.callTool('get_event_rankings', {
          event_key: eventKey,
        });

        expect(result.content).toBeInstanceOf(Array);
        const rankings = JSON.parse(result.content[0]?.text || '');
        expect(rankings).toHaveProperty('rankings');
      }
    });

    test('should get event matches', async () => {
      const eventsResult = await mcpClient.callTool('get_events', {
        year: 2023,
      });
      const events = JSON.parse(eventsResult.content[0]?.text || '');

      if (events.length > 0) {
        const eventKey = events[0].key;

        const result = await mcpClient.callTool('get_event_matches', {
          event_key: eventKey,
        });

        expect(result.content).toBeInstanceOf(Array);
        const matches = JSON.parse(result.content[0]?.text || '');
        expect(matches).toBeInstanceOf(Array);
      }
    });

    test('should get event alliances', async () => {
      const eventsResult = await mcpClient.callTool('get_events', {
        year: 2023,
      });
      const events = JSON.parse(eventsResult.content[0]?.text || '');

      if (events.length > 0) {
        const eventKey = events[0].key;

        const result = await mcpClient.callTool('get_event_alliances', {
          event_key: eventKey,
        });

        expect(result.content).toBeInstanceOf(Array);
        const alliances = JSON.parse(result.content[0]?.text || '');
        expect(alliances).toBeInstanceOf(Array);
      }
    });

    test('should get event OPRs', async () => {
      const eventsResult = await mcpClient.callTool('get_events', {
        year: 2023,
      });
      const events = JSON.parse(eventsResult.content[0]?.text || '');

      if (events.length > 0) {
        const eventKey = events[0].key;

        const result = await mcpClient.callTool('get_event_oprs', {
          event_key: eventKey,
        });

        expect(result.content).toBeInstanceOf(Array);
        const oprs = JSON.parse(result.content[0]?.text || '');
        expect(oprs).toHaveProperty('oprs');
        expect(oprs).toHaveProperty('dprs');
        expect(oprs).toHaveProperty('ccwms');
      }
    });
  });

  test.describe('Match Operations', () => {
    test('should get specific match information', async () => {
      const eventsResult = await mcpClient.callTool('get_events', {
        year: 2023,
      });
      const events = JSON.parse(eventsResult.content[0]?.text || '');

      if (events.length > 0) {
        const eventKey = events[0].key;

        const matchesResult = await mcpClient.callTool('get_event_matches', {
          event_key: eventKey,
        });
        const matches = JSON.parse(matchesResult.content[0]?.text || '');

        if (matches.length > 0) {
          const matchKey = matches[0].key;

          const result = await mcpClient.callTool('get_match', {
            match_key: matchKey,
          });

          expect(result.content).toBeInstanceOf(Array);
          const matchData = JSON.parse(result.content[0]?.text || '');
          expect(matchData).toMatchObject({
            key: matchKey,
            comp_level: expect.any(String),
            alliances: expect.objectContaining({
              red: expect.any(Object),
              blue: expect.any(Object),
            }),
          });
        }
      }
    });

    test('should get zebra motion data for a match', async () => {
      try {
        const result = await mcpClient.callTool('get_match_zebra', {
          match_key: '2023casj_qm1',
        });
        expect(result.content).toBeInstanceOf(Array);

        const zebraData = JSON.parse(result.content[0]?.text || '');
        expect(zebraData).toHaveProperty('key');
        expect(zebraData).toHaveProperty('times');
        expect(zebraData).toHaveProperty('alliances');
      } catch (error) {
        expect(String(error)).toMatch(/404 Not Found/);
        console.log('Zebra data not available for this match');
      }
    });
  });

  test.describe('General API Operations', () => {
    test('should get TBA status', async () => {
      const result = await mcpClient.callTool('get_status', {});

      expect(result.content).toBeInstanceOf(Array);
      const status = JSON.parse(result.content[0]?.text || '');

      expect(status).toMatchObject({
        current_season: expect.any(Number),
        max_season: expect.any(Number),
        is_datafeed_down: expect.any(Boolean),
        down_events: expect.any(Array),
        ios: expect.objectContaining({
          latest_app_version: expect.any(Number),
          min_app_version: expect.any(Number),
        }),
        android: expect.objectContaining({
          latest_app_version: expect.any(Number),
          min_app_version: expect.any(Number),
        }),
      });
    });

    test('should get teams with pagination', async () => {
      const result = await mcpClient.callTool('get_teams', {
        page_num: 0,
      });

      expect(result.content).toBeInstanceOf(Array);
      const teams = JSON.parse(result.content[0]?.text || '');
      expect(teams).toBeInstanceOf(Array);
      expect(teams.length).toBeGreaterThan(0);

      expect(teams[0]).toMatchObject({
        key: expect.stringMatching(/^frc\d+$/),
        team_number: expect.any(Number),
        name: expect.any(String),
      });
    });

    test('should get teams by year', async () => {
      const result = await mcpClient.callTool('get_teams_by_year', {
        year: 2023,
        page_num: 0,
      });

      expect(result.content).toBeInstanceOf(Array);
      const teams = JSON.parse(result.content[0]?.text || '');
      expect(teams).toBeInstanceOf(Array);
    });

    test('should get districts for a year', async () => {
      const result = await mcpClient.callTool('get_districts', {
        year: 2023,
      });

      expect(result.content).toBeInstanceOf(Array);
      const districts = JSON.parse(result.content[0]?.text || '');
      expect(districts).toBeInstanceOf(Array);

      if (districts.length > 0) {
        expect(districts[0]).toMatchObject({
          key: expect.stringMatching(/^2023/),
          abbreviation: expect.any(String),
          display_name: expect.any(String),
          year: 2023,
        });
      }
    });
  });

  test.describe('Simple API Operations', () => {
    test('should get team simple information', async () => {
      const result = await mcpClient.callTool('get_team_simple', {
        team_key: 'frc86',
      });

      expect(result.content).toBeInstanceOf(Array);
      const teamData = JSON.parse(result.content[0]?.text || '');
      expect(teamData).toMatchObject({
        key: 'frc86',
        team_number: 86,
        name: expect.any(String),
      });
    });

    test('should get events simple for a year', async () => {
      const result = await mcpClient.callTool('get_events_simple', {
        year: 2023,
      });

      expect(result.content).toBeInstanceOf(Array);
      const events = JSON.parse(result.content[0]?.text || '');
      expect(events).toBeInstanceOf(Array);
      expect(events.length).toBeGreaterThan(0);
    });

    test('should get teams simple with pagination', async () => {
      const result = await mcpClient.callTool('get_teams_simple', {
        page_num: 0,
      });

      expect(result.content).toBeInstanceOf(Array);
      const teams = JSON.parse(result.content[0]?.text || '');
      expect(teams).toBeInstanceOf(Array);
      expect(teams.length).toBeGreaterThan(0);
    });
  });

  test.describe('Key-Only Operations', () => {
    test('should get team keys', async () => {
      const result = await mcpClient.callTool('get_teams_keys', {
        page_num: 0,
      });

      expect(result.content).toBeInstanceOf(Array);
      const keys = JSON.parse(result.content[0]?.text || '');
      expect(keys).toBeInstanceOf(Array);
      expect(keys.length).toBeGreaterThan(0);
      expect(keys.every((key: string) => key.startsWith('frc'))).toBeTruthy();
    });

    test('should get event keys for a year', async () => {
      const result = await mcpClient.callTool('get_events_keys', {
        year: 2023,
      });

      expect(result.content).toBeInstanceOf(Array);
      const keys = JSON.parse(result.content[0]?.text || '');
      expect(keys).toBeInstanceOf(Array);
      expect(keys.length).toBeGreaterThan(0);
      expect(keys.every((key: string) => key.startsWith('2023'))).toBeTruthy();
    });
  });

  test.describe('Error Handling', () => {
    test('should handle invalid team key format', async () => {
      await expect(
        mcpClient.callTool('get_team', {
          team_key: '86',
        }),
      ).rejects.toThrow();
    });

    test('should handle invalid year', async () => {
      await expect(
        mcpClient.callTool('get_events', {
          year: 1990,
        }),
      ).rejects.toThrow();
    });

    test('should handle missing required parameters', async () => {
      await expect(mcpClient.callTool('get_team', {})).rejects.toThrow();
    });

    test('should handle unknown tool', async () => {
      await expect(mcpClient.callTool('unknown_tool', {})).rejects.toThrow();
    });
  });

  test.describe('Complex Workflow Tests', () => {
    test('should retrieve team event status workflow', async () => {
      const teamResult = await mcpClient.callTool('get_team_events', {
        team_key: 'frc86',
        year: 2023,
      });

      const events = JSON.parse(teamResult.content[0]?.text || '');

      if (events.length > 0) {
        const eventKey = events[0].key;

        const statusResult = await mcpClient.callTool('get_team_event_status', {
          team_key: 'frc86',
          event_key: eventKey,
        });

        expect(statusResult.content).toBeInstanceOf(Array);
        const status = JSON.parse(statusResult.content[0]?.text || '');
        expect(status).toHaveProperty('alliance_status_str');
        expect(status).toHaveProperty('playoff_status_str');
        expect(status).toHaveProperty('overall_status_str');
      }
    });

    test('should retrieve team event matches workflow', async () => {
      const teamResult = await mcpClient.callTool('get_team_events', {
        team_key: 'frc86',
        year: 2023,
      });

      const events = JSON.parse(teamResult.content[0]?.text || '');

      if (events.length > 0) {
        const eventKey = events[0].key;

        const matchesResult = await mcpClient.callTool(
          'get_team_event_matches',
          {
            team_key: 'frc86',
            event_key: eventKey,
          },
        );

        expect(matchesResult.content).toBeInstanceOf(Array);
        const matches = JSON.parse(matchesResult.content[0]?.text || '');
        expect(matches).toBeInstanceOf(Array);
      }
    });

    test('should retrieve event predictions workflow', async () => {
      const eventsResult = await mcpClient.callTool('get_events', {
        year: 2023,
      });
      const events = JSON.parse(eventsResult.content[0]?.text || '');

      if (events.length > 0) {
        const eventKey = events[0].key;

        const predictionsResult = await mcpClient.callTool(
          'get_event_predictions',
          {
            event_key: eventKey,
          },
        );

        expect(predictionsResult.content).toBeInstanceOf(Array);

        try {
          const predictions = JSON.parse(
            predictionsResult.content[0]?.text || '',
          );
          expect(predictions).toHaveProperty('match_predictions');
          expect(predictions).toHaveProperty('ranking_predictions');
        } catch {
          console.log('Predictions may not be available for this event');
        }
      }
    });
  });

  test.describe('District Operations', () => {
    test('should get district rankings', async () => {
      const districtsResult = await mcpClient.callTool('get_districts', {
        year: 2023,
      });
      const districts = JSON.parse(districtsResult.content[0]?.text || '');

      if (districts.length > 0) {
        const districtKey = districts[0].key;

        const result = await mcpClient.callTool('get_district_rankings', {
          district_key: districtKey,
        });

        expect(result.content).toBeInstanceOf(Array);
        const rankings = JSON.parse(result.content[0]?.text || '');
        expect(rankings).toBeInstanceOf(Array);

        if (rankings.length > 0) {
          expect(rankings[0]).toMatchObject({
            team_key: expect.stringMatching(/^frc\d+$/),
            rank: expect.any(Number),
            point_total: expect.any(Number),
          });
        }
      }
    });

    test('should get district events', async () => {
      const districtsResult = await mcpClient.callTool('get_districts', {
        year: 2023,
      });
      const districts = JSON.parse(districtsResult.content[0]?.text || '');

      if (districts.length > 0) {
        const districtKey = districts[0].key;

        const result = await mcpClient.callTool('get_district_events', {
          district_key: districtKey,
        });

        expect(result.content).toBeInstanceOf(Array);
        const events = JSON.parse(result.content[0]?.text || '');
        expect(events).toBeInstanceOf(Array);
      }
    });

    test('should get district teams', async () => {
      const districtsResult = await mcpClient.callTool('get_districts', {
        year: 2023,
      });
      const districts = JSON.parse(districtsResult.content[0]?.text || '');

      if (districts.length > 0) {
        const districtKey = districts[0].key;

        const result = await mcpClient.callTool('get_district_teams', {
          district_key: districtKey,
        });

        expect(result.content).toBeInstanceOf(Array);
        const teams = JSON.parse(result.content[0]?.text || '');
        expect(teams).toBeInstanceOf(Array);
      }
    });
  });
});
