# Neon MCP Server Setup for Pokemon Card Maker

This document explains how to set up and use the Neon MCP (Model Context Protocol) server with Cursor for your Pokemon card maker application.

## What is Neon MCP?

The Neon MCP server allows you to interact with your Neon PostgreSQL database directly through Cursor's AI assistant. This enables:

- Database schema management
- Data querying and manipulation
- Stack Auth integration and provisioning
- Real-time database monitoring

## Setup Instructions

### 1. MCP Configuration

The MCP server has been configured in `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "Neon": {
      "command": "npx",
      "args": ["-y", "mcp-remote@latest", "https://mcp.neon.tech/mcp"]
    }
  }
}
```

### 2. Restart Cursor

After adding the MCP configuration:

1. **Restart Cursor** or reload the window:

   - Open Command Palette (`Cmd+Shift+P` on Mac, `Ctrl+Shift+P` on Windows)
   - Run `Developer: Reload Window`

2. **Authorize Neon Access**:
   - An OAuth window will open in your browser
   - Sign in to your Neon account
   - Authorize Cursor to access your Neon projects

### 3. Verify MCP Integration

1. **Check MCP Settings**:

   - Go to Cursor Settings
   - Navigate to Features > MCP
   - Verify the Neon MCP server is listed and enabled

2. **Test MCP Tools**:
   - Open Cursor Chat (`Cmd+I` on Mac, `Ctrl+I` on Windows)
   - Select the "Agent" option
   - Type: `List your available MCP tools`
   - You should see Neon-related tools available

## Available MCP Tools

Once configured, you can use these commands in Cursor Chat:

### Database Management

- `Tell me about my Neon projects`
- `Show me the schema for my database`
- `List all tables in my database`
- `Query my database: SELECT * FROM users LIMIT 10`

### Stack Auth Integration

- `provision_neon_auth` - Set up Stack Auth integration
- `Check authentication setup for my project`
- `Show me user authentication tables`

### Project-Specific Commands

- `Tell me about my Neon project ep-muddy-lab-ae2qlvo6` (your project ID)
- `Show me database metrics for the Pokemon card maker`
- `List all tables related to cards and users`

## Environment Variables

Your current Neon database connection:

```bash
DATABASE_URL="postgresql://neondb_owner:npg_RDJem76qBUjT@ep-muddy-lab-ae2qlvo6-pooler.c-2.us-east-2.aws.neon.tech/neondb?channel_binding=require&sslmode=require"
```

## Stack Auth Integration

Once the MCP server is working, you can provision Stack Auth:

1. In Cursor Chat, type:

   ```
   provision_neon_auth for my Pokemon card maker project
   ```

2. This will:
   - Create a new Stack Auth project
   - Generate authentication credentials
   - Set up database schema for user authentication
   - Provide environment variables for your `.env.local`

## Troubleshooting

### MCP Server Not Working

1. Ensure Node.js 18+ is installed
2. Check internet connection
3. Verify Neon account access
4. Restart Cursor completely

### OAuth Issues

1. Clear browser cache and cookies
2. Try incognito/private browsing mode
3. Check if pop-ups are blocked

### Database Connection Issues

1. Verify DATABASE_URL in `.env.local`
2. Check Neon project status
3. Ensure database isn't suspended

## Security Notes

- The `.cursor/mcp.json` file is added to `.gitignore`
- Never commit OAuth tokens or sensitive credentials
- MCP server uses OAuth for secure authentication
- Database queries are executed with your Neon account permissions

## Next Steps

After MCP setup:

1. Use `provision_neon_auth` to set up Stack Auth
2. Update environment variables with new credentials
3. Test authentication flow in your application
4. Set up Row-Level Security (RLS) policies for data protection

## Support

- [Neon MCP Documentation](https://neon.com/guides/cursor-mcp-neon)
- [Cursor MCP Documentation](https://docs.cursor.com/context/model-context-protocol)
- [Stack Auth Documentation](https://docs.stack-auth.com/)
