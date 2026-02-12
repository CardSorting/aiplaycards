'use client';

import React, { useEffect, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Fade,
  Grow,
  LinearProgress,
  Typography,
} from '@mui/material';
import {
  AccessTime,
  EmojiEvents,
  MonetizationOn,
  Refresh,
  Stars,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';

interface ClaimStatus {
  canClaim: boolean;
  hoursUntilNextClaim: number;
  nextClaimTime: Date | null;
  lastClaimAmount: number;
  lastClaimTime: Date | null;
}

interface ClaimResult {
  success: boolean;
  creditsAwarded: number;
  newBalance: number;
  nextClaimAfter: Date;
  transactionId: number;
  error?: string;
}

const FreeCreditClaim: React.FC<{}> = () => {
  const router = useRouter();
  const [claimStatus, setClaimStatus] = useState<ClaimStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [claimResult, setClaimResult] = useState<ClaimResult | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const checkClaimStatus = async () => {
    try {
      setCheckingStatus(true);
      const response = await fetch('/api/credits/claim-free');
      const status = await response.json();
      setClaimStatus(status);
    } catch (error) {
      console.error('Failed to check claim status:', error);
    } finally {
      setCheckingStatus(false);
    }
  };

  const claimFreeCredits = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/credits/claim-free', {
        method: 'POST',
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setClaimResult(result);
        setShowSuccessDialog(true);
        // Update claim status
        await checkClaimStatus();
      } else {
        setClaimResult({ ...result, success: false });
      }
    } catch (error) {
      console.error('Failed to claim credits:', error);
      setClaimResult({
        success: false,
        creditsAwarded: 0,
        newBalance: 0,
        nextClaimAfter: new Date(),
        transactionId: 0,
        error: 'Network error. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkClaimStatus();
  }, []);

  const getTimeRemainingText = () => {
    if (!claimStatus || claimStatus.canClaim) return '';
    return `${claimStatus.hoursUntilNextClaim} hour${
      claimStatus.hoursUntilNextClaim !== 1 ? 's' : ''
    }`;
  };

  const getProgressValue = () => {
    if (!claimStatus || claimStatus.canClaim) return 100;
    // This is approximate - would need more precise timing in a real app
    return 0; // For demo, just show 0 or 100
  };

  return (
    <Fade in timeout={600}>
      <Card
        sx={{
          maxWidth: 500,
          mx: 'auto',
          background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
          borderRadius: 3,
          boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
          border: '1px solid rgba(0,0,0,0.05)',
        }}
      >
        <CardContent sx={{ p: 4, textAlign: 'center' }}>
          <Avatar
            sx={{
              width: 80,
              height: 80,
              mx: 'auto',
              mb: 2,
              bgcolor: claimStatus?.canClaim ? 'success.main' : 'primary.main',
            }}
          >
            {claimStatus?.canClaim ? (
              <Stars sx={{ fontSize: 40 }} />
            ) : (
              <AccessTime sx={{ fontSize: 40 }} />
            )}
          </Avatar>

          <Typography variant="h4" fontWeight={700} gutterBottom>
            Free Credits
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mb: 3, lineHeight: 1.6 }}
          >
            Claim free credits daily to build your collection! Get 5-20 credits
            that renew every 24 hours.
          </Typography>

          {checkingStatus ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
              <CircularProgress size={40} />
            </Box>
          ) : (
            <>
              {claimStatus?.canClaim ? (
                <Grow in timeout={400}>
                  <Box>
                    <Chip
                      label="🎉 Ready to Claim!"
                      color="success"
                      sx={{
                        px: 2,
                        py: 1,
                        fontSize: '1rem',
                        fontWeight: 600,
                        mb: 3,
                      }}
                    />

                    <Button
                      variant="contained"
                      size="large"
                      onClick={claimFreeCredits}
                      disabled={loading}
                      startIcon={
                        loading ? (
                          <CircularProgress size={20} />
                        ) : (
                          <MonetizationOn />
                        )
                      }
                      sx={{
                        py: 1.5,
                        px: 4,
                        fontSize: '1.2rem',
                        fontWeight: 700,
                        borderRadius: 3,
                        background: 'linear-gradient(45deg, #4CAF50, #45a049)',
                        boxShadow: '0 4px 15px rgba(76, 175, 80, 0.3)',
                        '&:hover': {
                          background:
                            'linear-gradient(45deg, #45a049, #3d8b40)',
                          boxShadow: '0 6px 20px rgba(76, 175, 80, 0.4)',
                        },
                        mb: 2,
                      }}
                    >
                      {loading ? 'Claiming...' : 'Claim Free Credits'}
                    </Button>

                    <Typography variant="body2" color="text.secondary">
                      Get 5-20 random credits instantly!
                    </Typography>
                  </Box>
                </Grow>
              ) : (
                <Grow in timeout={400}>
                  <Box>
                    <Chip
                      label={`⏰ ${getTimeRemainingText()} remaining`}
                      color="warning"
                      sx={{
                        px: 2,
                        py: 1,
                        fontSize: '0.95rem',
                        fontWeight: 600,
                        mb: 2,
                      }}
                    />

                    <Typography
                      variant="h6"
                      color="text.primary"
                      sx={{ mb: 2 }}
                    >
                      Come back later for more credits!
                    </Typography>

                    <LinearProgress
                      variant="determinate"
                      value={getProgressValue()}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        mb: 2,
                        backgroundColor: 'grey.200',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: 'warning.main',
                        },
                      }}
                    />

                    <Button
                      variant="outlined"
                      size="medium"
                      startIcon={<Refresh />}
                      onClick={checkClaimStatus}
                      sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                      }}
                    >
                      Refresh Status
                    </Button>

                    {claimStatus?.lastClaimAmount && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 2 }}
                      >
                        Last claimed: {claimStatus.lastClaimAmount} credits
                        {claimStatus.lastClaimTime && (
                          <span>
                            {' '}
                            on {claimStatus.lastClaimTime.toLocaleDateString()}
                          </span>
                        )}
                      </Typography>
                    )}
                  </Box>
                </Grow>
              )}
            </>
          )}

          {/* Error Alert */}
          {claimResult && !claimResult.success && (
            <Alert
              severity="error"
              sx={{ mt: 3, borderRadius: 2 }}
              onClose={() => setClaimResult(null)}
            >
              {claimResult.error ||
                'Failed to claim credits. Please try again.'}
            </Alert>
          )}
        </CardContent>

        {/* Success Dialog */}
        <Dialog
          open={showSuccessDialog}
          onClose={() => setShowSuccessDialog(false)}
          maxWidth="sm"
          fullWidth
          TransitionComponent={Grow}
        >
          <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                mx: 'auto',
                mb: 2,
                bgcolor: 'success.main',
              }}
            >
              <EmojiEvents sx={{ fontSize: 48 }} />
            </Avatar>
            <Typography variant="h4" fontWeight={700}>
              🎉 Credits Claimed!
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ textAlign: 'center' }}>
            <Typography variant="h5" sx={{ mb: 2 }}>
              You got {claimResult?.creditsAwarded} free credits!
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Your new balance is {claimResult?.newBalance} credits.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 1, justifyContent: 'center' }}>
            <Button
              onClick={() => setShowSuccessDialog(false)}
              variant="outlined"
              sx={{ mr: 2 }}
            >
              Close
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                setShowSuccessDialog(false);
                router.push('/booster');
              }}
              startIcon={<MonetizationOn />}
              sx={{
                background: 'linear-gradient(45deg, #2196F3, #1976D2)',
              }}
            >
              Open Booster Packs
            </Button>
          </DialogActions>
        </Dialog>
      </Card>
    </Fade>
  );
};

export default FreeCreditClaim;
