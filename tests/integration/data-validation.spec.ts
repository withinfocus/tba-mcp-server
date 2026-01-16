import { expect } from '@playwright/test';
import { MCPClient } from './mcp-client.js';
import { createAndInitializeMCPClient } from './setup.js';
import { test } from './setup.js';

test.describe('Data Validation Integration Tests', () => {
  let mcpClient: MCPClient;

  test.beforeEach(async () => {
    mcpClient = await createAndInitializeMCPClient();
  });

  test.afterEach(async () => {
    await mcpClient.stop();
  });

  test.describe('Schema Validation', () => {
    test('should return valid team schema', async () => {
      const result = await mcpClient.callTool('get_team', {
        team_key: 'frc86',
      });

      expect(result.content).toBeInstanceOf(Array);
      const teamData = JSON.parse(result.content[0]?.text || '');

      expect(teamData).toMatchObject({
        key: expect.stringMatching(/^frc\d+$/),
        team_number: expect.any(Number),
        name: expect.any(String),
      });

      expect(teamData.key).toBe('frc86');
      expect(teamData.team_number).toBe(86);
    });

    test('should return valid event schema', async () => {
      const result = await mcpClient.callTool('get_events', {
        year: 2023,
      });

      expect(result.content).toBeInstanceOf(Array);
      const events = JSON.parse(result.content[0]?.text || '');
      expect(events).toBeInstanceOf(Array);

      if (events.length > 0) {
        const event = events[0];
        expect(event).toMatchObject({
          key: expect.any(String),
          name: expect.any(String),
          event_code: expect.any(String),
          event_type: expect.any(Number),
          start_date: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
          end_date: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
          year: 2023,
          event_type_string: expect.any(String),
        });
      }
    });

    test('should return valid match schema', async () => {
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
          const match = matches[0];
          expect(match).toMatchObject({
            key: expect.any(String),
            comp_level: expect.any(String),
            set_number: expect.any(Number),
            match_number: expect.any(Number),
            alliances: expect.objectContaining({
              red: expect.objectContaining({
                score: expect.any(Number),
                team_keys: expect.arrayContaining([
                  expect.stringMatching(/^frc\d+$/),
                ]),
              }),
              blue: expect.objectContaining({
                score: expect.any(Number),
                team_keys: expect.arrayContaining([
                  expect.stringMatching(/^frc\d+$/),
                ]),
              }),
            }),
            event_key: eventKey,
          });
        }
      }
    });

    test('should return valid status schema', async () => {
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
        max_team_page: expect.any(Number),
      });

      expect(status.current_season).toBeGreaterThanOrEqual(1992);
      expect(status.max_season).toBeGreaterThanOrEqual(status.current_season);
    });
  });

  test.describe('Data Consistency', () => {
    test('should return consistent team data across different endpoints', async () => {
      const teamKey = 'frc86';

      const fullTeamResult = await mcpClient.callTool('get_team', {
        team_key: teamKey,
      });
      const simpleTeamResult = await mcpClient.callTool('get_team_simple', {
        team_key: teamKey,
      });

      const fullTeam = JSON.parse(fullTeamResult.content[0]?.text || '');
      const simpleTeam = JSON.parse(simpleTeamResult.content[0]?.text || '');

      expect(fullTeam.key).toBe(simpleTeam.key);
      expect(fullTeam.team_number).toBe(simpleTeam.team_number);
      expect(fullTeam.name).toBe(simpleTeam.name);

      if (fullTeam.nickname) {
        expect(fullTeam.nickname).toBe(simpleTeam.nickname);
      }
    });

    test('should return consistent event data across different endpoints', async () => {
      const eventsResult = await mcpClient.callTool('get_events', {
        year: 2023,
      });
      const eventsSimpleResult = await mcpClient.callTool('get_events_simple', {
        year: 2023,
      });

      const events = JSON.parse(eventsResult.content[0]?.text || '');
      const eventsSimple = JSON.parse(
        eventsSimpleResult.content[0]?.text || ''
      );

      expect(events.length).toBe(eventsSimple.length);

      if (events.length > 0 && eventsSimple.length > 0) {
        const fullEvent = events[0];
        const simpleEvent = eventsSimple.find(
          (e: { key: string }) => e.key === fullEvent.key
        );

        if (simpleEvent) {
          expect(fullEvent.key).toBe(simpleEvent.key);
          expect(fullEvent.name).toBe(simpleEvent.name);
          expect(fullEvent.year).toBe(simpleEvent.year);
        }
      }
    });

    test('should return valid team keys in all key endpoints', async () => {
      const teamsKeysResult = await mcpClient.callTool('get_teams_keys', {
        page_num: 0,
      });
      const teamKeys = JSON.parse(teamsKeysResult.content[0]?.text || '');

      expect(teamKeys).toBeInstanceOf(Array);
      expect(teamKeys.length).toBeGreaterThan(0);

      for (const key of teamKeys.slice(0, 5)) {
        expect(key).toMatch(/^frc\d+$/);

        const teamResult = await mcpClient.callTool('get_team', {
          team_key: key,
        });
        const team = JSON.parse(teamResult.content[0]?.text || '');
        expect(team.key).toBe(key);
      }
    });
  });

  test.describe('Null and Optional Field Handling', () => {
    test('should handle teams with null optional fields', async () => {
      const result = await mcpClient.callTool('get_teams', {
        page_num: 0,
      });

      const teams = JSON.parse(result.content[0]?.text || '');
      expect(teams).toBeInstanceOf(Array);

      if (teams.length > 0) {
        const team = teams[0];

        expect(['string', 'undefined']).toContain(typeof team.nickname);
        expect(['string', 'undefined']).toContain(typeof team.city);
        expect(['string', 'undefined']).toContain(typeof team.state_prov);
        expect(['string', 'undefined']).toContain(typeof team.website);
        expect(['number', 'undefined']).toContain(typeof team.rookie_year);
      }
    });

    test('should handle events with null optional fields', async () => {
      const result = await mcpClient.callTool('get_events', {
        year: 2023,
      });

      const events = JSON.parse(result.content[0]?.text || '');
      expect(events).toBeInstanceOf(Array);

      if (events.length > 0) {
        const event = events[0];

        expect(['string', 'undefined']).toContain(typeof event.short_name);
        expect(['number', 'undefined']).toContain(typeof event.week);
        expect(['string', 'undefined']).toContain(typeof event.timezone);
        expect(['string', 'undefined']).toContain(typeof event.website);
      }
    });
  });

  test.describe('Large Data Handling', () => {
    test('should handle large event with many teams', async () => {
      const eventsResult = await mcpClient.callTool('get_events', {
        year: 2023,
      });
      const events = JSON.parse(eventsResult.content[0]?.text || '');

      const championshipEvents = events.filter(
        (e: { event_type: number; event_type_string?: string }) =>
          e.event_type === 3 || e.event_type_string?.includes('Championship')
      );

      if (championshipEvents.length > 0) {
        const eventKey = championshipEvents[0].key;

        const teamsResult = await mcpClient.callTool('get_event_teams', {
          event_key: eventKey,
        });

        const teams = JSON.parse(teamsResult.content[0]?.text || '');
        expect(teams).toBeInstanceOf(Array);

        if (teams.length > 50) {
          expect(teams.length).toBeGreaterThan(50);
          teams
            .slice(0, 10)
            .forEach(
              (team: { key: string; team_number: number; name: string }) => {
                expect(team).toHaveProperty('key');
                expect(team).toHaveProperty('team_number');
                expect(team).toHaveProperty('name');
              }
            );
        }
      }
    });

    test('should handle events with many matches', async () => {
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
        expect(matches).toBeInstanceOf(Array);

        matches
          .slice(0, 5)
          .forEach(
            (match: {
              key: string;
              alliances: { red: unknown; blue: unknown };
            }) => {
              expect(match).toHaveProperty('key');
              expect(match).toHaveProperty('alliances');
              expect(match.alliances).toHaveProperty('red');
              expect(match.alliances).toHaveProperty('blue');
            }
          );
      }
    });
  });

  test.describe('Response Format Validation', () => {
    test('should always return properly formatted MCP responses', async () => {
      const tools = [
        { name: 'get_status', args: {} },
        { name: 'get_team', args: { team_key: 'frc86' } },
        { name: 'get_events', args: { year: 2023 } },
        { name: 'get_teams', args: { page_num: 0 } },
      ];

      for (const tool of tools) {
        const result = await mcpClient.callTool(tool.name, tool.args);

        expect(result).toHaveProperty('content');
        expect(result.content).toBeInstanceOf(Array);
        expect(result.content.length).toBeGreaterThan(0);
        expect(result.content[0]).toMatchObject({
          type: 'text',
          text: expect.any(String),
        });

        expect(() => JSON.parse(result.content[0]?.text || '')).not.toThrow();
      }
    });
  });
});
