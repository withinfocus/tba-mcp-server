import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { z } from 'zod';
import type { Client, Tool } from '@modelcontextprotocol/client';
import { READ_ONLY_API, tools } from '../src/tools.js';
import { connectInMemoryClient } from './in-memory-client.js';

// The TBA path each tool requests for the sample arguments below. Guards
// against routing regressions.
const SAMPLE_ARGS = {
  team_key: 'frc86',
  year: 2024,
  event_key: '2024hop',
  match_key: '2024hop_qm1',
  district_key: '2024fim',
  media_tag: 'imagery',
  page_num: 0,
  district_abbreviation: 'fim',
  category: 'leaderboard',
  query: 'cheesy',
};

const EXPECTED_ENDPOINTS: Record<string, string> = {
  get_team: '/team/frc86',
  get_team_events: '/team/frc86/events/2024',
  get_team_awards: '/team/frc86/awards/2024',
  get_team_matches: '/team/frc86/matches/2024',
  get_events: '/events/2024',
  get_event: '/event/2024hop',
  get_event_teams: '/event/2024hop/teams',
  get_event_rankings: '/event/2024hop/rankings',
  get_event_matches: '/event/2024hop/matches',
  get_event_alliances: '/event/2024hop/alliances',
  get_event_insights: '/event/2024hop/insights',
  get_event_district_points: '/event/2024hop/district_points',
  get_team_years_participated: '/team/frc86/years_participated',
  get_team_districts: '/team/frc86/districts',
  get_team_robots: '/team/frc86/robots',
  get_team_media: '/team/frc86/media/2024',
  get_team_event_matches: '/team/frc86/event/2024hop/matches',
  get_teams: '/teams/0',
  get_status: '/status',
  get_match: '/match/2024hop_qm1',
  get_event_oprs: '/event/2024hop/oprs',
  get_event_awards: '/event/2024hop/awards',
  get_team_awards_all: '/team/frc86/awards',
  get_team_events_all: '/team/frc86/events',
  get_team_event_status: '/team/frc86/event/2024hop/status',
  get_districts: '/districts/2024',
  get_district_rankings: '/district/2024fim/rankings',
  get_teams_simple: '/teams/0/simple',
  get_teams_keys: '/teams/0/keys',
  get_teams_by_year: '/teams/2024/0',
  get_teams_by_year_simple: '/teams/2024/0/simple',
  get_teams_by_year_keys: '/teams/2024/0/keys',
  get_team_simple: '/team/frc86/simple',
  get_event_simple: '/event/2024hop/simple',
  get_events_simple: '/events/2024/simple',
  get_events_keys: '/events/2024/keys',
  get_match_simple: '/match/2024hop_qm1/simple',
  get_team_events_simple: '/team/frc86/events/2024/simple',
  get_team_events_keys: '/team/frc86/events/2024/keys',
  get_team_event_awards: '/team/frc86/event/2024hop/awards',
  get_team_matches_simple: '/team/frc86/matches/2024/simple',
  get_team_matches_keys: '/team/frc86/matches/2024/keys',
  get_team_social_media: '/team/frc86/social_media',
  get_team_media_by_tag: '/team/frc86/media/tag/imagery',
  get_team_media_by_tag_year: '/team/frc86/media/tag/imagery/2024',
  get_event_teams_simple: '/event/2024hop/teams/simple',
  get_event_teams_keys: '/event/2024hop/teams/keys',
  get_event_matches_simple: '/event/2024hop/matches/simple',
  get_event_matches_keys: '/event/2024hop/matches/keys',
  get_team_history: '/team/frc86/history',
  get_team_event_statuses: '/team/frc86/events/2024/statuses',
  get_team_event_matches_simple: '/team/frc86/event/2024hop/matches/simple',
  get_team_event_matches_keys: '/team/frc86/event/2024hop/matches/keys',
  get_district_events: '/district/2024fim/events',
  get_district_events_simple: '/district/2024fim/events/simple',
  get_district_events_keys: '/district/2024fim/events/keys',
  get_district_teams: '/district/2024fim/teams',
  get_district_teams_simple: '/district/2024fim/teams/simple',
  get_district_teams_keys: '/district/2024fim/teams/keys',
  get_match_zebra: '/match/2024hop_qm1/zebra_motionworks',
  get_event_predictions: '/event/2024hop/predictions',
  get_district_history: '/district/fim/history',
  get_district_dcmp_history: '/district/fim/dcmp_history',
  get_district_insights: '/district/fim/insights',
  get_district_advancement: '/district/2024fim/advancement',
  get_district_awards: '/district/2024fim/awards',
  get_event_advancement_points: '/event/2024hop/advancement_points',
  get_event_coprs: '/event/2024hop/coprs',
  get_event_practice_matches: '/event/2024hop/matches/practice',
  get_event_practice_matches_simple: '/event/2024hop/matches/practice/simple',
  get_event_practice_matches_keys: '/event/2024hop/matches/practice/keys',
  get_event_media: '/event/2024hop/media',
  get_event_nexus_info: '/event/2024hop/nexus_info',
  get_event_playoff_advancement: '/event/2024hop/playoff_advancement',
  get_event_regional_champs_pool_points:
    '/event/2024hop/regional_champs_pool_points',
  get_event_team_media: '/event/2024hop/team_media',
  get_event_teams_statuses: '/event/2024hop/teams/statuses',
  get_insights_leaderboards: '/insights/leaderboards/2024',
  get_insights_notables: '/insights/notables/2024',
  get_insights: '/insights/2024',
  get_insights_by_category: '/insights/2024/leaderboard',
  get_insights_for_district: '/insights/2024/district/fim',
  get_insights_for_district_by_category:
    '/insights/2024/leaderboard/district/fim',
  get_regional_advancement: '/regional_advancement/2024',
  get_regional_rankings: '/regional_advancement/2024/rankings',
  get_search_index: '/search_index',
  get_sponsors: '/sponsors',
  get_team_events_all_simple: '/team/frc86/events/simple',
  get_team_events_all_keys: '/team/frc86/events/keys',
};

describe('Tool table', () => {
  it('should define all 89 tools', () => {
    expect(tools).toHaveLength(89);
  });

  it('should have unique tool names', () => {
    const names = tools.map((tool) => tool.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it('should give every tool a title, description, schemas, and endpoint', () => {
    tools.forEach((tool) => {
      expect(tool.name).toMatch(/^get_[a-z_]+$/);
      expect(tool.title.length).toBeGreaterThan(0);
      expect(tool.description.length).toBeGreaterThan(10);
      expect(tool.inputSchema).toBeInstanceOf(z.ZodObject);
      expect(tool.responseSchema).toBeInstanceOf(z.ZodType);
      expect(typeof tool.endpoint).toBe('function');
    });
  });

  it('should build the expected TBA endpoint for every tool', () => {
    expect(Object.keys(EXPECTED_ENDPOINTS).sort()).toEqual(
      tools.map((tool) => tool.name).sort(),
    );

    tools.forEach((tool) => {
      const args = tool.inputSchema.parse(
        Object.fromEntries(
          Object.keys(tool.inputSchema.shape).map((key) => [
            key,
            SAMPLE_ARGS[key as keyof typeof SAMPLE_ARGS],
          ]),
        ),
      );
      expect(tool.endpoint(args)).toBe(EXPECTED_ENDPOINTS[tool.name]);
    });
  });
});

describe('Tool definitions served by tools/list', () => {
  let client: Client;
  let listed: Tool[];

  beforeAll(async () => {
    client = await connectInMemoryClient();
    listed = (await client.listTools()).tools;
  });

  afterAll(async () => {
    await client.close();
  });

  describe('tools array', () => {
    it('should list every tool in table order', () => {
      expect(listed.map((tool) => tool.name)).toEqual(
        tools.map((tool) => tool.name),
      );
    });

    it('should have all required properties for each tool', () => {
      listed.forEach((tool) => {
        expect(tool).toHaveProperty('name');
        expect(tool).toHaveProperty('description');
        expect(tool).toHaveProperty('inputSchema');
        expect(typeof tool.name).toBe('string');
        expect(typeof tool.description).toBe('string');
        expect(typeof tool.inputSchema).toBe('object');
      });
    });

    it('should have unique tool names', () => {
      const names = listed.map((tool) => tool.name);
      const uniqueNames = new Set(names);
      expect(uniqueNames.size).toBe(names.length);
    });

    it('should have valid JSON Schema for inputSchema', () => {
      listed.forEach((tool) => {
        expect(tool.inputSchema).toHaveProperty('type');
        expect(tool.inputSchema.type).toBe('object');
        expect(tool.inputSchema).toHaveProperty('properties');
        expect(typeof tool.inputSchema.properties).toBe('object');
      });
    });

    it('should carry the table title, description, and read-only annotations', () => {
      listed.forEach((tool) => {
        const definition = tools.find((t) => t.name === tool.name);
        expect(tool.title).toBe(definition?.title);
        expect(tool.description).toBe(definition?.description);
        expect(tool.annotations).toEqual({
          ...READ_ONLY_API,
          title: definition?.title,
        });
      });
    });
  });

  describe('specific tool definitions', () => {
    const find = (name: string) => listed.find((t) => t.name === name);

    it('should have get_team tool', () => {
      const getTool = find('get_team');
      expect(getTool).toBeDefined();
      expect(getTool?.description).toContain('team');
      expect(getTool?.inputSchema.properties).toHaveProperty('team_key');
      expect(getTool?.inputSchema.required).toContain('team_key');
    });

    it('should have get_status tool', () => {
      const getTool = find('get_status');
      expect(getTool).toBeDefined();
      expect(getTool?.description).toContain('status');
    });

    it('should have get_teams tool with pagination', () => {
      const getTool = find('get_teams');
      expect(getTool).toBeDefined();
      expect(getTool?.inputSchema.properties).toHaveProperty('page_num');
    });

    it('should have get_event tool', () => {
      const getTool = find('get_event');
      expect(getTool).toBeDefined();
      expect(getTool?.inputSchema.properties).toHaveProperty('event_key');
      expect(getTool?.inputSchema.required).toContain('event_key');
    });

    it('should have get_match tool', () => {
      const getTool = find('get_match');
      expect(getTool).toBeDefined();
      expect(getTool?.inputSchema.properties).toHaveProperty('match_key');
      expect(getTool?.inputSchema.required).toContain('match_key');
    });

    it('should have get_event_coprs tool with OPR caveats', () => {
      const getTool = find('get_event_coprs');
      expect(getTool).toBeDefined();
      expect(getTool?.description).toContain('component');
      expect(getTool?.description).toContain('get_event_oprs');
      expect(getTool?.inputSchema.required).toEqual(['event_key']);
    });

    it('should have get_search_index tool that requires a query', () => {
      const getTool = find('get_search_index');
      expect(getTool).toBeDefined();
      expect(getTool?.inputSchema.required).toEqual(['query']);
      expect(getTool?.inputSchema.properties?.['query']).toMatchObject({
        type: 'string',
        minLength: 2,
      });
    });

    it('should have get_insights_by_category tool with a category enum', () => {
      const getTool = find('get_insights_by_category');
      expect(getTool).toBeDefined();
      expect(getTool?.inputSchema.properties?.['category']).toMatchObject({
        enum: ['leaderboard', 'streak', 'timeseries', 'game_stats', 'clubs'],
      });
    });

    it('should validate district_abbreviation as lowercase letters', () => {
      const withAbbreviation = listed.filter((t) =>
        Object.keys(t.inputSchema.properties || {}).includes(
          'district_abbreviation',
        ),
      );

      expect(withAbbreviation.map((t) => t.name).sort()).toEqual([
        'get_district_dcmp_history',
        'get_district_history',
        'get_district_insights',
        'get_insights_for_district',
        'get_insights_for_district_by_category',
      ]);
      withAbbreviation.forEach((tool) => {
        expect(
          tool.inputSchema.properties?.['district_abbreviation'],
        ).toMatchObject({ type: 'string', pattern: '^[a-z]+$' });
      });
    });
  });

  describe('team_key validation in schemas', () => {
    it('should have pattern validation for team_key parameters', () => {
      const toolsWithTeamKey = listed.filter((t) =>
        Object.keys(t.inputSchema.properties || {}).includes('team_key'),
      );

      expect(toolsWithTeamKey.length).toBeGreaterThan(0);

      toolsWithTeamKey.forEach((tool) => {
        const teamKeyProp = tool.inputSchema.properties?.['team_key'];
        if (typeof teamKeyProp === 'object' && teamKeyProp !== null) {
          expect(teamKeyProp).toHaveProperty('pattern');
          expect((teamKeyProp as { pattern?: string }).pattern).toContain(
            'frc',
          );
        }
      });
    });
  });

  describe('year validation in schemas', () => {
    it('should have range validation for year parameters', () => {
      const toolsWithYear = listed.filter((t) =>
        Object.keys(t.inputSchema.properties || {}).includes('year'),
      );

      expect(toolsWithYear.length).toBeGreaterThan(0);

      toolsWithYear.forEach((tool) => {
        const yearProp = tool.inputSchema.properties?.['year'] as {
          anyOf?: Array<Record<string, unknown>>;
        };
        // Insights tools also accept 0 for all-time insights.
        const range = tool.name.startsWith('get_insights')
          ? yearProp.anyOf?.find((branch) => 'minimum' in branch)
          : yearProp;
        if (tool.name.startsWith('get_insights')) {
          expect(yearProp.anyOf).toContainEqual({ type: 'number', const: 0 });
        }
        expect(range).toHaveProperty('minimum', 1992);
        expect(range).toHaveProperty('maximum');
      });
    });
  });

  describe('page_num validation in schemas', () => {
    it('should require a non-negative integer page number', () => {
      const toolsWithPage = listed.filter((t) =>
        Object.keys(t.inputSchema.properties || {}).includes('page_num'),
      );

      expect(toolsWithPage.length).toBe(6);

      toolsWithPage.forEach((tool) => {
        expect(tool.inputSchema.properties?.['page_num']).toMatchObject({
          type: 'integer',
          minimum: 0,
        });
      });
    });
  });

  describe('tool categories', () => {
    it('should have team-related tools', () => {
      const teamTools = listed.filter((t) => t.name.includes('team'));
      expect(teamTools.length).toBeGreaterThan(0);
    });

    it('should have event-related tools', () => {
      const eventTools = listed.filter((t) => t.name.includes('event'));
      expect(eventTools.length).toBeGreaterThan(0);
    });

    it('should have match-related tools', () => {
      const matchTools = listed.filter((t) => t.name.includes('match'));
      expect(matchTools.length).toBeGreaterThan(0);
    });

    it('should have district-related tools', () => {
      const districtTools = listed.filter((t) => t.name.includes('district'));
      expect(districtTools.length).toBeGreaterThan(0);
    });
  });

  describe('required parameters', () => {
    it('should specify required parameters where applicable', () => {
      const toolsWithRequired = listed.filter(
        (t) => t.inputSchema.required && t.inputSchema.required.length > 0,
      );

      expect(toolsWithRequired.length).toBeGreaterThan(0);

      toolsWithRequired.forEach((tool) => {
        tool.inputSchema.required?.forEach((reqParam) => {
          expect(tool.inputSchema.properties).toHaveProperty(reqParam);
        });
      });
    });

    it('should require every parameter', () => {
      listed.forEach((tool) => {
        const properties = Object.keys(tool.inputSchema.properties || {});
        expect([...(tool.inputSchema.required ?? [])].sort()).toEqual(
          properties.sort(),
        );
      });
      expect(
        listed
          .filter(
            (t) => Object.keys(t.inputSchema.properties || {}).length === 0,
          )
          .map((t) => t.name),
      ).toEqual(['get_status', 'get_sponsors']);
    });
  });

  describe('tool descriptions', () => {
    it('should have meaningful descriptions for all tools', () => {
      listed.forEach((tool) => {
        expect(tool.description).toBeDefined();
        expect(tool.description?.length).toBeGreaterThan(10);
        expect(tool.description).not.toContain('TODO');
        expect(tool.description).not.toContain('FIXME');
      });
    });
  });

  describe('parameter descriptions', () => {
    it('should have descriptions for all parameters', () => {
      listed.forEach((tool) => {
        if (tool.inputSchema.properties) {
          Object.entries(tool.inputSchema.properties).forEach(
            ([, paramSchema]) => {
              if (typeof paramSchema === 'object' && paramSchema !== null) {
                expect(paramSchema).toHaveProperty('description');
                expect(
                  typeof (paramSchema as { description?: unknown }).description,
                ).toBe('string');
              }
            },
          );
        }
      });
    });
  });
});
