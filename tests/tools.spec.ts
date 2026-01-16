import { describe, it, expect } from '@jest/globals';
import { tools } from '../src/tools.js';

describe('Tool definitions', () => {
  describe('tools array', () => {
    it('should export an array of tools', () => {
      expect(Array.isArray(tools)).toBe(true);
      expect(tools.length).toBeGreaterThan(0);
    });

    it('should have all required properties for each tool', () => {
      tools.forEach((tool) => {
        expect(tool).toHaveProperty('name');
        expect(tool).toHaveProperty('description');
        expect(tool).toHaveProperty('inputSchema');
        expect(typeof tool.name).toBe('string');
        expect(typeof tool.description).toBe('string');
        expect(typeof tool.inputSchema).toBe('object');
      });
    });

    it('should have unique tool names', () => {
      const names = tools.map((tool) => tool.name);
      const uniqueNames = new Set(names);
      expect(uniqueNames.size).toBe(names.length);
    });

    it('should have valid JSON Schema for inputSchema', () => {
      tools.forEach((tool) => {
        expect(tool.inputSchema).toHaveProperty('type');
        expect(tool.inputSchema.type).toBe('object');
        expect(tool.inputSchema).toHaveProperty('properties');
        expect(typeof tool.inputSchema.properties).toBe('object');
      });
    });
  });

  describe('specific tool definitions', () => {
    it('should have get_team tool', () => {
      const getTool = tools.find((t) => t.name === 'get_team');
      expect(getTool).toBeDefined();
      expect(getTool?.description).toContain('team');
      expect(getTool?.inputSchema.properties).toHaveProperty('team_key');
      expect(getTool?.inputSchema.required).toContain('team_key');
    });

    it('should have get_status tool', () => {
      const getTool = tools.find((t) => t.name === 'get_status');
      expect(getTool).toBeDefined();
      expect(getTool?.description).toContain('status');
    });

    it('should have get_teams tool with pagination', () => {
      const getTool = tools.find((t) => t.name === 'get_teams');
      expect(getTool).toBeDefined();
      expect(getTool?.inputSchema.properties).toHaveProperty('page_num');
    });

    it('should have get_event tool', () => {
      const getTool = tools.find((t) => t.name === 'get_event');
      expect(getTool).toBeDefined();
      expect(getTool?.inputSchema.properties).toHaveProperty('event_key');
      expect(getTool?.inputSchema.required).toContain('event_key');
    });

    it('should have get_match tool', () => {
      const getTool = tools.find((t) => t.name === 'get_match');
      expect(getTool).toBeDefined();
      expect(getTool?.inputSchema.properties).toHaveProperty('match_key');
      expect(getTool?.inputSchema.required).toContain('match_key');
    });
  });

  describe('team_key validation in schemas', () => {
    it('should have pattern validation for team_key parameters', () => {
      const toolsWithTeamKey = tools.filter((t) =>
        Object.keys(t.inputSchema.properties || {}).includes('team_key')
      );

      expect(toolsWithTeamKey.length).toBeGreaterThan(0);

      toolsWithTeamKey.forEach((tool) => {
        const teamKeyProp = tool.inputSchema.properties?.['team_key'];
        if (typeof teamKeyProp === 'object' && teamKeyProp !== null) {
          expect(teamKeyProp).toHaveProperty('pattern');
          expect((teamKeyProp as { pattern?: string }).pattern).toContain(
            'frc'
          );
        }
      });
    });
  });

  describe('year validation in schemas', () => {
    it('should have range validation for year parameters', () => {
      const toolsWithYear = tools.filter((t) =>
        Object.keys(t.inputSchema.properties || {}).includes('year')
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

  describe('tool categories', () => {
    it('should have team-related tools', () => {
      const teamTools = tools.filter((t) => t.name.includes('team'));
      expect(teamTools.length).toBeGreaterThan(0);
    });

    it('should have event-related tools', () => {
      const eventTools = tools.filter((t) => t.name.includes('event'));
      expect(eventTools.length).toBeGreaterThan(0);
    });

    it('should have match-related tools', () => {
      const matchTools = tools.filter((t) => t.name.includes('match'));
      expect(matchTools.length).toBeGreaterThan(0);
    });

    it('should have district-related tools', () => {
      const districtTools = tools.filter((t) => t.name.includes('district'));
      expect(districtTools.length).toBeGreaterThan(0);
    });
  });

  describe('required parameters', () => {
    it('should specify required parameters where applicable', () => {
      const toolsWithRequired = tools.filter(
        (t) => t.inputSchema.required && t.inputSchema.required.length > 0
      );

      expect(toolsWithRequired.length).toBeGreaterThan(0);

      toolsWithRequired.forEach((tool) => {
        tool.inputSchema.required?.forEach((reqParam) => {
          expect(tool.inputSchema.properties).toHaveProperty(reqParam);
        });
      });
    });
  });

  describe('tool descriptions', () => {
    it('should have meaningful descriptions for all tools', () => {
      tools.forEach((tool) => {
        expect(tool.description).toBeDefined();
        expect(tool.description?.length).toBeGreaterThan(10);
        expect(tool.description).not.toContain('TODO');
        expect(tool.description).not.toContain('FIXME');
      });
    });
  });

  describe('parameter descriptions', () => {
    it('should have descriptions for all parameters', () => {
      tools.forEach((tool) => {
        if (tool.inputSchema.properties) {
          Object.entries(tool.inputSchema.properties).forEach(
            ([, paramSchema]) => {
              if (typeof paramSchema === 'object' && paramSchema !== null) {
                expect(paramSchema).toHaveProperty('description');
                expect(
                  typeof (paramSchema as { description?: unknown }).description
                ).toBe('string');
              }
            }
          );
        }
      });
    });
  });
});
