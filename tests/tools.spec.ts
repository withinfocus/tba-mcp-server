import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { z } from 'zod';
import type { Client, Tool } from '@modelcontextprotocol/client';
import { READ_ONLY_API, tools } from '../src/tools.js';
import { connectInMemoryClient } from './in-memory-client.js';

// The TBA path each tool requested before the move to the tool table, for
// the sample arguments below. Guards against routing regressions.
const SAMPLE_ARGS = {
  team_key: 'frc86',
  year: 2024,
  event_key: '2024hop',
  match_key: '2024hop_qm1',
  district_key: '2024fim',
  media_tag: 'imagery',
  page_num: 0,
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
  get_match_zebra: '/match/2024hop_qm1/zebra',
  get_event_predictions: '/event/2024hop/predictions',
};

describe('Tool table', () => {
  it('should define all 61 tools', () => {
    expect(tools).toHaveLength(61);
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

  it('should build the same TBA endpoint for every tool as before', () => {
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
        const yearProp = tool.inputSchema.properties?.['year'];
        if (typeof yearProp === 'object' && yearProp !== null) {
          expect(yearProp).toHaveProperty('minimum');
          expect((yearProp as { minimum?: number }).minimum).toBe(1992);
          expect(yearProp).toHaveProperty('maximum');
        }
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

    it('should require every parameter except for get_status', () => {
      listed.forEach((tool) => {
        const properties = Object.keys(tool.inputSchema.properties || {});
        expect([...(tool.inputSchema.required ?? [])].sort()).toEqual(
          properties.sort(),
        );
      });
      expect(
        listed.find((t) => t.name === 'get_status')?.inputSchema.properties,
      ).toEqual({});
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
