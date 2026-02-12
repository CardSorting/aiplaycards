'use client';

import React from 'react';
import { Box, Grid, Paper } from '@mui/material';
import { MTGCardProvider } from '../../contexts/MTGCardContext';
import { MTGCardForm } from '../forms/MTGCardForm';
import { MTGCardPreview } from '../preview/MTGCardPreview';
import { MTGCardToolbar } from './MTGCardToolbar';

export function MTGCardEditor() {
  return (
    <MTGCardProvider>
      <Box
        sx={{
          width: '100%',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
        }}
      >
        <MTGCardToolbar />

        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            p: 2,
          }}
        >
          <Grid container spacing={3} sx={{ minHeight: 'calc(100vh - 120px)' }}>
            {/* Editor Panel */}
            <Grid item xs={12} lg={5} sx={{ display: 'flex' }}>
              <Paper
                sx={{
                  flex: 1,
                  p: 3,
                  maxHeight: 'calc(100vh - 160px)',
                  overflow: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: '16px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                  background: 'rgba(255,255,255,0.98)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                }}
              >
                <Box sx={{ flex: 1 }}>
                  <MTGCardForm />
                </Box>
              </Paper>
            </Grid>

            {/* Preview Panel */}
            <Grid item xs={12} lg={7} sx={{ display: 'flex' }}>
              <Paper
                sx={{
                  flex: 1,
                  p: 3,
                  background:
                    'radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0.05) 100%)',
                  maxHeight: 'calc(100vh - 160px)',
                  overflow: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: '16px',
                  boxShadow:
                    'inset 0 0 20px rgba(0,0,0,0.05), 0 8px 32px rgba(0,0,0,0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                <Box
                  sx={{
                    flex: 1,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: 0,
                  }}
                >
                  <MTGCardPreview />
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </MTGCardProvider>
  );
}
