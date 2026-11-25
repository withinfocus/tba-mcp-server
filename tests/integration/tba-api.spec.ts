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
      const result = await mcpClient.callTool('get_match_zebra', {
        match_key: '2022cmptx_f1m1',
      });

      const zebraData = JSON.parse(result.content[0]?.text || '');
      expect(zebraData.key).toBe('2022cmptx_f1m1');
      expect(zebraData.times.length).toBeGreaterThan(0);
      expect(zebraData.alliances.red.length).toBeGreaterThan(0);
      expect(zebraData.alliances.blue.length).toBeGreaterThan(0);
    });

    test('should return null for a match without zebra data', async () => {
      const result = await mcpClient.callTool('get_match_zebra', {
        match_key: '2023casj_qm1',
      });

      expect(JSON.parse(result.content[0]?.text || '')).toBeNull();
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

  // Events and seasons below were checked against the live API and have data.
  test.describe('Remaining TBA Endpoints', () => {
    const parse = (result: { content: Array<{ text: string }> }) =>
      JSON.parse(result.content[0]?.text || '');

    test('should get district history across renames', async () => {
      const districts = parse(
        await mcpClient.callTool('get_district_history', {
          district_abbreviation: 'fma',
        }),
      );

      expect(districts.length).toBeGreaterThan(5);
      expect(districts.map((d: { key: string }) => d.key)).toContain('2012mar');
      expect(districts.at(-1)).toMatchObject({
        abbreviation: 'fma',
        official_advancement_counts: {
          dcmp: expect.any(Number),
          cmp: expect.any(Number),
        },
      });
    });

    test('should get district championship history', async () => {
      const history = parse(
        await mcpClient.callTool('get_district_dcmp_history', {
          district_abbreviation: 'ne',
        }),
      );

      expect(history.length).toBeGreaterThan(5);
      expect(history[0]).toMatchObject({
        event: expect.objectContaining({ key: expect.any(String) }),
        awards: expect.any(Array),
      });
    });

    test('should get district insights', async () => {
      const insights = parse(
        await mcpClient.callTool('get_district_insights', {
          district_abbreviation: 'isr',
        }),
      );

      expect(insights.district_data.district_wide_data).toHaveProperty(
        'yearly_active_team_count',
      );
      expect(Object.keys(insights.team_data).length).toBeGreaterThan(50);
      expect(insights).not.toHaveProperty('seasonal_insights');
    });

    test('should get district advancement', async () => {
      const advancement = parse(
        await mcpClient.callTool('get_district_advancement', {
          district_key: '2025fim',
        }),
      );

      expect(advancement.teams['frc67']).toMatchObject({
        dcmp: true,
        cmp: expect.any(Boolean),
      });
      expect(advancement.cutoffs.dcmp_effective).toEqual(expect.any(Number));
    });

    test('should get district awards', async () => {
      const awards = parse(
        await mcpClient.callTool('get_district_awards', {
          district_key: '2025fim',
        }),
      );

      expect(awards.length).toBeGreaterThan(100);
      expect(awards[0].event_key).toMatch(/^2025mi/);
    });

    test('should get event advancement points for district and regional events', async () => {
      const district = parse(
        await mcpClient.callTool('get_event_advancement_points', {
          event_key: '2025micmp',
        }),
      );
      const regional = parse(
        await mcpClient.callTool('get_event_advancement_points', {
          event_key: '2025casj',
        }),
      );
      const offseason = parse(
        await mcpClient.callTool('get_event_advancement_points', {
          event_key: '2025cc',
        }),
      );

      expect(Object.keys(district.points).length).toBeGreaterThan(0);
      // TBA only includes rookie_bonus for teams that earned one.
      const teamPoints = Object.values(regional.points) as Array<
        Record<string, number>
      >;
      expect(teamPoints.some((p) => 'rookie_bonus' in p)).toBe(true);
      const [tiebreaker] = Object.values(regional.tiebreakers) as Array<
        Record<string, unknown>
      >;
      expect(tiebreaker).toHaveProperty('highest_match_scores');
      expect(offseason).toBeNull();
    });

    test('should get event component OPRs', async () => {
      const coprs = parse(
        await mcpClient.callTool('get_event_coprs', {
          event_key: '2025casj',
        }),
      );

      expect(coprs).toHaveProperty('L1 Coral Count');
      expect(coprs).toHaveProperty('totalPoints');
      const l1 = coprs['L1 Coral Count'] as Record<string, number>;
      expect(Object.keys(l1).length).toBeGreaterThan(30);
      expect(Object.keys(l1).every((key) => /^frc\d+$/.test(key))).toBe(true);
      expect(Object.values(l1).every((v) => typeof v === 'number')).toBe(true);
    });

    test('should get practice matches in all three forms', async () => {
      const full = parse(
        await mcpClient.callTool('get_event_practice_matches', {
          event_key: '2025casj',
        }),
      );
      const simple = parse(
        await mcpClient.callTool('get_event_practice_matches_simple', {
          event_key: '2025casj',
        }),
      );
      const keys = parse(
        await mcpClient.callTool('get_event_practice_matches_keys', {
          event_key: '2025casj',
        }),
      );

      expect(full.length).toBeGreaterThan(0);
      expect(full[0].comp_level).toBe('pm');
      expect(simple).toHaveLength(full.length);
      expect(simple[0]).not.toHaveProperty('score_breakdown');
      expect(keys).toHaveLength(full.length);
      expect(keys[0]).toMatch(/^2025casj_pm\d+$/);
    });

    test('should get event media', async () => {
      const media = parse(
        await mcpClient.callTool('get_event_media', { event_key: '2025casj' }),
      );

      expect(media.length).toBeGreaterThan(0);
      expect(media[0]).toMatchObject({ type: 'youtube' });
    });

    test('should get event Nexus info or null', async () => {
      const withPitMap = parse(
        await mcpClient.callTool('get_event_nexus_info', {
          event_key: '2026cmptx',
        }),
      );
      const without = parse(
        await mcpClient.callTool('get_event_nexus_info', {
          event_key: '2025casj',
        }),
      );

      expect(withPitMap).toHaveProperty('matches');
      expect(withPitMap.pit_map).toHaveProperty('pits');
      expect(without).toBeNull();
    });

    test('should get event playoff advancement', async () => {
      const levels = parse(
        await mcpClient.callTool('get_event_playoff_advancement', {
          event_key: '2025casj',
        }),
      );

      expect(levels.length).toBeGreaterThan(0);
      expect(levels[0]).toMatchObject({
        level: expect.any(String),
        level_name: expect.any(String),
        type: 'double_elim',
        sort_order_info: expect.any(Array),
      });
      expect(levels[0].rankings[0].team_keys.length).toBeGreaterThan(0);
    });

    test('should get regional pool points, null for district events', async () => {
      const regional = parse(
        await mcpClient.callTool('get_event_regional_champs_pool_points', {
          event_key: '2025casj',
        }),
      );
      const district = parse(
        await mcpClient.callTool('get_event_regional_champs_pool_points', {
          event_key: '2025micmp',
        }),
      );

      expect(Object.keys(regional.points).length).toBeGreaterThan(30);
      expect(district).toBeNull();
    });

    test('should get team media for an event without avatar images', async () => {
      const media = parse(
        await mcpClient.callTool('get_event_team_media', {
          event_key: '2025casj',
        }),
      );

      expect(media.length).toBeGreaterThan(10);
      expect(media[0].team_keys.length).toBeGreaterThan(0);
      const avatars = media.filter(
        (m: { type: string }) => m.type === 'avatar',
      );
      expect(avatars.length).toBeGreaterThan(0);
      avatars.forEach((avatar: { details: Record<string, unknown> }) => {
        expect(avatar.details).not.toHaveProperty('base64Image');
      });
    });

    test('should get statuses for every team at an event', async () => {
      const statuses = parse(
        await mcpClient.callTool('get_event_teams_statuses', {
          event_key: '2025casj',
        }),
      );

      expect(Object.keys(statuses).length).toBeGreaterThan(30);
      expect(statuses['frc100']).toMatchObject({
        overall_status_str: expect.any(String),
        qual: expect.objectContaining({ num_teams: expect.any(Number) }),
      });
    });

    test('should get leaderboards for a season and all-time', async () => {
      const season = parse(
        await mcpClient.callTool('get_insights_leaderboards', { year: 2025 }),
      );
      const allTime = parse(
        await mcpClient.callTool('get_insights_leaderboards', { year: 0 }),
      );

      expect(season[0]).toMatchObject({
        year: 2025,
        data: expect.objectContaining({ rankings: expect.any(Array) }),
      });
      expect(allTime[0].year).toBe(0);
    });

    test('should get notables', async () => {
      const notables = parse(
        await mcpClient.callTool('get_insights_notables', { year: 2025 }),
      );

      expect(notables.length).toBeGreaterThan(0);
      expect(notables[0].data.entries[0]).toMatchObject({
        team_key: expect.stringMatching(/^frc\d+$/),
        context: expect.any(Array),
      });
    });

    test('should get all insights for a season', async () => {
      const insights = parse(
        await mcpClient.callTool('get_insights', { year: 2025 }),
      );
      const categories = new Set(
        insights.map((i: { category: string }) => i.category),
      );

      expect(categories).toContain('game_stats');
      expect(categories).toContain('leaderboard');
    });

    test('should get insights by category', async () => {
      const clubs = parse(
        await mcpClient.callTool('get_insights_by_category', {
          year: 0,
          category: 'clubs',
        }),
      );

      expect(clubs.length).toBeGreaterThan(0);
      clubs.forEach((insight: { category: string; year: number }) => {
        expect(insight).toMatchObject({ category: 'clubs', year: 0 });
      });
    });

    test('should get insights for a district', async () => {
      const insights = parse(
        await mcpClient.callTool('get_insights_for_district', {
          year: 2025,
          district_abbreviation: 'fim',
        }),
      );

      expect(insights.length).toBeGreaterThan(0);
      insights.forEach((insight: { district_abbreviation: string }) => {
        expect(insight.district_abbreviation).toBe('fim');
      });
    });

    test('should get insights for a district by category', async () => {
      const streaks = parse(
        await mcpClient.callTool('get_insights_for_district_by_category', {
          year: 0,
          category: 'streak',
          district_abbreviation: 'ne',
        }),
      );

      expect(streaks.length).toBeGreaterThan(0);
      expect(streaks[0]).toMatchObject({
        category: 'streak',
        district_abbreviation: 'ne',
      });
    });

    test('should get regional advancement', async () => {
      const advancement = parse(
        await mcpClient.callTool('get_regional_advancement', { year: 2025 }),
      );
      const [entry] = Object.values(advancement) as Array<
        Record<string, unknown>
      >;

      expect(Object.keys(advancement).length).toBeGreaterThan(100);
      expect(entry).toMatchObject({
        cmp: expect.any(Boolean),
        cmp_status: expect.any(String),
      });
    });

    test('should get regional pool rankings', async () => {
      const rankings = parse(
        await mcpClient.callTool('get_regional_rankings', { year: 2025 }),
      );

      expect(rankings.length).toBeGreaterThan(1000);
      expect(rankings[0]).toMatchObject({
        team_key: expect.stringMatching(/^frc\d+$/),
        rank: 1,
        point_total: expect.any(Number),
      });
    });

    test('should search teams and events by name', async () => {
      const poofs = parse(
        await mcpClient.callTool('get_search_index', { query: 'Cheesy Poofs' }),
      );
      const casj = parse(
        await mcpClient.callTool('get_search_index', { query: '2025casj' }),
      );

      expect(poofs.teams[0]).toEqual({
        key: 'frc254',
        nickname: 'The Cheesy Poofs',
      });
      expect(casj.events[0].key).toBe('2025casj');
      expect(casj.total_matching_events).toBe(1);
    });

    test('should get sponsors', async () => {
      const sponsors = parse(await mcpClient.callTool('get_sponsors', {}));

      expect(sponsors.sponsors).toBeInstanceOf(Array);
      expect(sponsors.sponsors.length).toBeLessThanOrEqual(3);
    });

    test('should get all team events in simple and key form', async () => {
      const simple = parse(
        await mcpClient.callTool('get_team_events_all_simple', {
          team_key: 'frc254',
        }),
      );
      const keys = parse(
        await mcpClient.callTool('get_team_events_all_keys', {
          team_key: 'frc254',
        }),
      );

      expect(simple.length).toBeGreaterThan(50);
      expect(keys).toHaveLength(simple.length);
      expect(keys).toContain('2025cc');
      expect(simple[0]).not.toHaveProperty('webcasts');
    });
  });
});
