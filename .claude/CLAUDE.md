# The Blue Alliance MCP Server - Claude Instructions

## Project Overview

This is an MCP (Model Context Protocol) server for The Blue Alliance - a robotics competition data platform. The server provides structured access to FRC (FIRST Robotics Competition) data through the MCP protocol.

## Project Structure

- **Language**: TypeScript with Node.js
- **Framework**: MCP SDK (@modelcontextprotocol/sdk)
- **Package Manager**: npm
- **Main Entry**: `src/index.ts`
- **Build Output**: `dist/`
- **Transport**: stdio for MCP communication

## Development Commands

- `npm run build` - Compile TypeScript to JavaScript
- `npm run lint` - Run ESLint and Prettier checks
- `npm run lint:fix` - Auto-fix linting issues
- `npm run test` - Run Jest tests
- `npm run inspect` - Launch MCP inspector for debugging
- `npm run test:watch` - Run tests in watch mode

## Code Standards

- TypeScript with strict type checking
- ESLint for code quality
- Prettier for formatting
- Husky for pre-commit hooks
- Jest for testing

## MCP Server Details

- **Name**: The Blue Alliance MCP Server
- **Transport**: StdioServerTransport
- **Current Capabilities**: Basic server setup (tools capability placeholder)

## Key Files

- `src/index.ts` - Main server implementation
- `package.json` - Project configuration and dependencies
- `tsconfig.json` - TypeScript configuration
- `eslint.config.js` - ESLint rules
- `jest.config.js` - Jest test configuration

## When Working on This Project

1. Always run `npm run build` after making changes
2. Run `npm run lint` to ensure code quality
3. Run tests with `npm run test` before committing
4. Use `npm run inspect` to debug MCP functionality
5. Follow existing TypeScript patterns and MCP SDK conventions
