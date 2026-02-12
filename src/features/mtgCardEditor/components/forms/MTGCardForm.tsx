'use client';

import React from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Typography,
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import { useMTGCard } from '../../contexts/MTGCardContext';
import { BasicInfoForm } from './BasicInfoForm';
import { ManaCostForm } from './ManaCostForm';
import { CardTypeForm } from './CardTypeForm';
import { StatsForm } from './StatsForm';
import { TextForm } from './TextForm';
import { ArtForm } from './ArtForm';

export function MTGCardForm() {
  const { state } = useMTGCard();
  const { validation } = state;

  return (
    <Box sx={{ width: '100%' }}>
      {/* Basic Information */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Basic Information</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <BasicInfoForm />
        </AccordionDetails>
      </Accordion>

      {/* Mana Cost */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Mana Cost</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <ManaCostForm />
        </AccordionDetails>
      </Accordion>

      {/* Card Type */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Card Type</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <CardTypeForm />
        </AccordionDetails>
      </Accordion>

      {/* Stats (Power/Toughness/Loyalty) */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Stats</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <StatsForm />
        </AccordionDetails>
      </Accordion>

      {/* Card Text */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Card Text</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <TextForm />
        </AccordionDetails>
      </Accordion>

      {/* Artwork */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Artwork</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <ArtForm />
        </AccordionDetails>
      </Accordion>

      {/* Validation Errors */}
      {Object.keys(validation.errors).length > 0 && (
        <Box sx={{ mt: 2, p: 2, backgroundColor: '#ffebee', borderRadius: 1 }}>
          <Typography variant="h6" color="error" gutterBottom>
            Validation Errors:
          </Typography>
          {Object.entries(validation.errors).map(([field, error]) => (
            <Typography key={field} variant="body2" color="error">
              • {field}: {error}
            </Typography>
          ))}
        </Box>
      )}

      {/* Validation Warnings */}
      {Object.keys(validation.warnings).length > 0 && (
        <Box sx={{ mt: 2, p: 2, backgroundColor: '#fff3e0', borderRadius: 1 }}>
          <Typography variant="h6" color="warning.main" gutterBottom>
            Warnings:
          </Typography>
          {Object.entries(validation.warnings).map(([field, warning]) => (
            <Typography key={field} variant="body2" color="warning.main">
              • {field}: {warning}
            </Typography>
          ))}
        </Box>
      )}
    </Box>
  );
}
