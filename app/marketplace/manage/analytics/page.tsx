'use client';
import { useSession } from 'next-auth/react';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  Link as MUILink,
  MenuItem,
  Skeleton,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { formatUsd } from '../../../../src/utils/currency';

type Listing = {
  id: number;
  priceCredits: number;
  soldAt?: string | null;
  status?: 'active' | 'sold' | 'canceled';
  createdAt?: string;
  cardType?: string;
};

export default function SellerAnalyticsPage() {
  const { data: session } = useSession();
  const user = session?.user;
  const isMobile = useMediaQuery('(max-width:960px)');
  const isTablet = useMediaQuery('(max-width:1200px)');
  const isSmallMobile = useMediaQuery('(max-width:480px)');
  const [loading, setLoading] = useState(true);
  const [soldRows, setSoldRows] = useState<Listing[]>([]);
  const [credits, setCredits] = useState<number | null>(null);
  const [windowPreset, setWindowPreset] = useState<
    '7' | '30' | '90' | 'custom'
  >('30');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [activeCount, setActiveCount] = useState<number | null>(null);

  // Seller balance states
  const [sellerBalance, setSellerBalance] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [withdrawDialog, setWithdrawDialog] = useState({
    open: false,
    amount: '',
    paypalEmail: '',
    busy: false,
  });

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!user?.id) {
        setLoading(false);
        setSoldRows([]);
        return;
      }
      setLoading(true);
      try {
        const params = new URLSearchParams({
          limit: '500',
          seller: user.id,
          status: 'sold',
          sort: 'new',
        });
        const res = await fetch(`/api/marketplace?${params.toString()}`);
        const data = await res.json();
        const rows: Listing[] = Array.isArray(data?.data) ? data.data : [];
        if (mounted) setSoldRows(rows);
      } catch {
        if (mounted) setSoldRows([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    async function loadCredits() {
      try {
        const res = await fetch('/api/credits');
        const data = await res.json();
        setCredits(typeof data?.credits === 'number' ? data.credits : null);
      } catch {
        setCredits(null);
      }
    }
    async function loadActiveCount() {
      if (!user?.id) {
        setActiveCount(null);
        return;
      }
      try {
        const params = new URLSearchParams({
          limit: '1',
          seller: user.id,
          status: 'active',
        });
        const res = await fetch(`/api/marketplace?${params.toString()}`);
        const data = await res.json();
        setActiveCount(Number(data?.total || 0));
      } catch {
        setActiveCount(null);
      }
    }
    async function loadSellerBalance() {
      if (!user?.id) return;
      try {
        const [balanceRes, withdrawalsRes] = await Promise.all([
          fetch('/api/seller/balance'),
          fetch('/api/seller/withdraw'),
        ]);

        if (balanceRes.ok) {
          const balanceData = await balanceRes.json();
          if (mounted) {
            setSellerBalance(balanceData.balance);
            setTransactions(balanceData.transactions);
          }
        }

        if (withdrawalsRes.ok) {
          const withdrawalsData = await withdrawalsRes.json();
          if (mounted) setWithdrawals(withdrawalsData.withdrawals);
        }
      } catch (error) {
        console.error('Failed to load seller balance:', error);
      }
    }

    loadCredits();
    load();
    loadActiveCount();
    loadSellerBalance();
    const t = setInterval(() => {
      load();
      loadSellerBalance();
    }, 30000);
    return () => {
      mounted = false;
      clearInterval(t);
    };
  }, [user?.id]);

  const {
    rowsInWindow,
    soldCount,
    gross,
    net,
    avg,
    avgDaysToSell,
    dailySeries,
    maxDailyGross,
    topTypes,
  } = useMemo(() => {
    let startMs: number;
    let endMs: number;
    const now = new Date();
    if (windowPreset === 'custom' && startDate && endDate) {
      startMs = new Date(startDate).getTime();
      endMs = new Date(endDate).getTime() + 24 * 60 * 60 * 1000 - 1;
    } else {
      const days = parseInt(windowPreset, 10);
      startMs = now.getTime() - days * 24 * 60 * 60 * 1000;
      endMs = now.getTime();
    }
    const within = soldRows.filter(
      r =>
        r.soldAt &&
        (() => {
          const t = new Date(r.soldAt!).getTime();
          return t >= startMs && t <= endMs;
        })(),
    );
    const soldCount = within.length;
    const gross = within.reduce((sum, r) => sum + r.priceCredits, 0);
    const fee = Math.floor(gross * 0.1);
    const net = gross - fee;
    const avg = soldCount ? Math.round(gross / soldCount) : 0;
    const avgDaysToSell = (() => {
      const withCreated = within.filter(r => r.createdAt && r.soldAt);
      if (withCreated.length === 0) return 0;
      const totalDays = withCreated.reduce(
        (sum, r) =>
          sum +
          Math.max(
            0,
            (new Date(r.soldAt!).getTime() - new Date(r.createdAt!).getTime()) /
              (24 * 60 * 60 * 1000),
          ),
        0,
      );
      return Math.round(totalDays / withCreated.length);
    })();
    const byDay: Record<string, number> = {};
    within.forEach(r => {
      const d = new Date(r.soldAt!);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
        2,
        '0',
      )}-${String(d.getDate()).padStart(2, '0')}`;
      byDay[key] = (byDay[key] || 0) + r.priceCredits;
    });
    const series = Object.entries(byDay)
      .sort((a, b) => (a[0] < b[0] ? -1 : 1))
      .map(([date, total]) => ({ date, total }));
    const maxDailyGross = series.reduce((m, s) => Math.max(m, s.total), 0) || 1;
    const typeMap: Record<string, { revenue: number; count: number }> = {};
    within.forEach(r => {
      const t = r.cardType || 'Unknown';
      if (!typeMap[t]) typeMap[t] = { revenue: 0, count: 0 };
      typeMap[t].revenue += r.priceCredits;
      typeMap[t].count += 1;
    });
    const topTypes = Object.entries(typeMap)
      .sort((a, b) => b[1].revenue - a[1].revenue)
      .slice(0, 5)
      .map(([type, v]) => ({ type, ...v }));
    return {
      rowsInWindow: within,
      soldCount,
      gross,
      net,
      avg,
      avgDaysToSell,
      dailySeries: series,
      maxDailyGross,
      topTypes,
    };
  }, [soldRows, windowPreset, startDate, endDate]);

  function exportCsv() {
    const headers = ['id', 'soldAt', 'priceCredits', 'cardType'];
    const body = rowsInWindow.map(r =>
      [r.id, r.soldAt || '', r.priceCredits, r.cardType || ''].join(','),
    );
    const csv = [headers.join(','), ...body].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sales.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  const handleWithdrawRequest = async () => {
    if (!withdrawDialog.amount || !withdrawDialog.paypalEmail) return;

    setWithdrawDialog(prev => ({ ...prev, busy: true }));

    try {
      const response = await fetch('/api/seller/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: withdrawDialog.amount,
          paypalEmail: withdrawDialog.paypalEmail,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Refresh balance data
        const balanceRes = await fetch('/api/seller/balance');
        const withdrawalsRes = await fetch('/api/seller/withdraw');

        if (balanceRes.ok) {
          const balanceData = await balanceRes.json();
          setSellerBalance(balanceData.balance);
          setTransactions(balanceData.transactions);
        }

        if (withdrawalsRes.ok) {
          const withdrawalsData = await withdrawalsRes.json();
          setWithdrawals(withdrawalsData.withdrawals);
        }

        setWithdrawDialog({
          open: false,
          amount: '',
          paypalEmail: '',
          busy: false,
        });
      } else {
        alert(data.error || 'Withdrawal request failed');
      }
    } catch (error) {
      console.error('Withdrawal request error:', error);
      alert('Withdrawal request failed');
    } finally {
      setWithdrawDialog(prev => ({ ...prev, busy: false }));
    }
  };

  return (
    <Container
      maxWidth="lg"
      sx={{ py: { xs: 2, sm: 3, md: 4 }, px: { xs: 1, sm: 2 } }}
    >
      {/* Breadcrumbs */}
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <MUILink component={Link} href="/">
          Home
        </MUILink>
        <MUILink component={Link} href="/marketplace">
          Marketplace
        </MUILink>
        <MUILink component={Link} href="/marketplace/manage">
          Manage
        </MUILink>
        <Typography color="text.primary">Analytics</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        justifyContent="space-between"
        spacing={{ xs: 2, sm: 0 }}
        sx={{ mb: { xs: 2, md: 3 } }}
      >
        <Typography
          variant={isSmallMobile ? 'h5' : 'h4'}
          fontWeight={800}
          sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' } }}
        >
          Dashboard Analytics
        </Typography>

        {/* Filters Card */}
        <Card sx={{ width: { xs: '100%', sm: 'auto' } }}>
          <CardContent
            sx={{
              p: { xs: 2, sm: 3 },
              '&:last-child': { pb: { xs: 2, sm: 3 } },
            }}
          >
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              alignItems={{ xs: 'stretch', sm: 'center' }}
              spacing={{ xs: 1.5, sm: 1 }}
            >
              <TextField
                size={isSmallMobile ? 'medium' : 'small'}
                select
                label="Window"
                value={windowPreset}
                onChange={e => setWindowPreset(e.target.value as any)}
                sx={{ minWidth: { xs: '100%', sm: 160 } }}
              >
                <MenuItem value={'7'}>Last 7 days</MenuItem>
                <MenuItem value={'30'}>Last 30 days</MenuItem>
                <MenuItem value={'90'}>Last 90 days</MenuItem>
                <MenuItem value={'custom'}>Custom</MenuItem>
              </TextField>
              {windowPreset === 'custom' && (
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={{ xs: 1, sm: 1 }}
                  sx={{ width: { xs: '100%', sm: 'auto' } }}
                >
                  <TextField
                    size={isSmallMobile ? 'medium' : 'small'}
                    type="date"
                    label="Start"
                    InputLabelProps={{ shrink: true }}
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    sx={{ flex: { xs: 1, sm: 'none' } }}
                  />
                  <TextField
                    size={isSmallMobile ? 'medium' : 'small'}
                    type="date"
                    label="End"
                    InputLabelProps={{ shrink: true }}
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    sx={{ flex: { xs: 1, sm: 'none' } }}
                  />
                </Stack>
              )}
              <Button
                variant="outlined"
                onClick={exportCsv}
                size={isSmallMobile ? 'medium' : 'small'}
                sx={{ width: { xs: '100%', sm: 'auto' } }}
              >
                {isSmallMobile ? 'Export' : 'Export CSV'}
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Stack>

      {!user?.id && (
        <Card sx={{ mb: { xs: 2, md: 3 } }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
              Please sign in to view analytics.
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Seller Balance Section */}
      <Grid
        container
        spacing={{ xs: 1.5, sm: 2, md: 3 }}
        sx={{ mb: { xs: 2, md: 3 } }}
      >
        <Grid item xs={12}>
          <Typography
            variant={isSmallMobile ? 'subtitle1' : 'h6'}
            fontWeight={700}
            sx={{
              mb: { xs: 1, sm: 2 },
              fontSize: { xs: '1.1rem', sm: '1.25rem' },
            }}
          >
            Seller Balance
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'success.main', color: 'success.contrastText' }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography
                variant="overline"
                color="inherit"
                sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
              >
                Available Balance
              </Typography>
              <Typography
                variant={isSmallMobile ? 'h6' : 'h5'}
                fontWeight={700}
                sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}
              >
                {sellerBalance
                  ? formatUsd(parseFloat(sellerBalance.availableBalance))
                  : '—'}
              </Typography>
              <Button
                variant="contained"
                color="inherit"
                size={isSmallMobile ? 'medium' : 'small'}
                sx={{
                  mt: { xs: 1, sm: 1 },
                  bgcolor: 'rgba(255,255,255,0.2)',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
                  fontSize: { xs: '0.8rem', sm: '0.875rem' },
                }}
                onClick={() =>
                  setWithdrawDialog({ ...withdrawDialog, open: true })
                }
                disabled={
                  !sellerBalance ||
                  parseFloat(sellerBalance.availableBalance) < 1.0
                }
              >
                Withdraw
              </Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography
                variant="overline"
                color="text.secondary"
                sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
              >
                Pending Balance
              </Typography>
              <Typography
                variant={isSmallMobile ? 'subtitle1' : 'h6'}
                sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}
              >
                {sellerBalance
                  ? formatUsd(parseFloat(sellerBalance.pendingBalance))
                  : '—'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography
                variant="overline"
                color="text.secondary"
                sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
              >
                Total Earnings
              </Typography>
              <Typography
                variant={isSmallMobile ? 'subtitle1' : 'h6'}
                sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}
              >
                {sellerBalance
                  ? formatUsd(parseFloat(sellerBalance.totalEarnings))
                  : '—'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography
                variant="overline"
                color="text.secondary"
                sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
              >
                Pending Withdrawals
              </Typography>
              <Typography
                variant={isSmallMobile ? 'subtitle1' : 'h6'}
                sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}
              >
                {
                  withdrawals.filter(
                    w => w.status === 'pending' || w.status === 'processing',
                  ).length
                }
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Analytics Section */}
      <Grid
        container
        spacing={{ xs: 1.5, sm: 2, md: 3 }}
        sx={{ mb: { xs: 2, md: 3 } }}
      >
        <Grid item xs={12}>
          <Typography
            variant={isSmallMobile ? 'subtitle1' : 'h6'}
            fontWeight={700}
            sx={{
              mb: { xs: 1, sm: 2 },
              fontSize: { xs: '1.1rem', sm: '1.25rem' },
            }}
          >
            Sales Analytics
          </Typography>
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
          <Card>
            <CardContent sx={{ p: { xs: 1.5, sm: 3 } }}>
              <Typography
                variant="overline"
                color="text.secondary"
                sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
              >
                Available Credits
              </Typography>
              <Typography
                variant={isSmallMobile ? 'subtitle1' : 'h6'}
                sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}
              >
                {credits ?? (loading ? <Skeleton width={80} /> : '—')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
          <Card>
            <CardContent sx={{ p: { xs: 1.5, sm: 3 } }}>
              <Typography
                variant="overline"
                color="text.secondary"
                sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
              >
                Units Sold
              </Typography>
              <Typography
                variant={isSmallMobile ? 'subtitle1' : 'h6'}
                sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}
              >
                {loading ? <Skeleton width={40} /> : soldCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
          <Card>
            <CardContent sx={{ p: { xs: 1.5, sm: 3 } }}>
              <Typography
                variant="overline"
                color="text.secondary"
                sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
              >
                Gross Sales
              </Typography>
              <Typography
                variant={isSmallMobile ? 'subtitle1' : 'h6'}
                sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}
              >
                {loading ? <Skeleton width={80} /> : `${gross} credits`}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
          <Card>
            <CardContent sx={{ p: { xs: 1.5, sm: 3 } }}>
              <Typography
                variant="overline"
                color="text.secondary"
                sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
              >
                Estimated Net
              </Typography>
              <Typography
                variant={isSmallMobile ? 'subtitle1' : 'h6'}
                sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}
              >
                {loading ? <Skeleton width={80} /> : `${net} credits`}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
          <Card>
            <CardContent sx={{ p: { xs: 1.5, sm: 3 } }}>
              <Typography
                variant="overline"
                color="text.secondary"
                sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
              >
                Average Sale
              </Typography>
              <Typography
                variant={isSmallMobile ? 'subtitle1' : 'h6'}
                sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}
              >
                {loading ? <Skeleton width={60} /> : `${avg} credits`}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
          <Card>
            <CardContent sx={{ p: { xs: 1.5, sm: 3 } }}>
              <Typography
                variant="overline"
                color="text.secondary"
                sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
              >
                Avg Days to Sell
              </Typography>
              <Typography
                variant={isSmallMobile ? 'subtitle1' : 'h6'}
                sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}
              >
                {loading ? <Skeleton width={60} /> : `${avgDaysToSell} days`}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
          <Card>
            <CardContent sx={{ p: { xs: 1.5, sm: 3 } }}>
              <Typography
                variant="overline"
                color="text.secondary"
                sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
              >
                Active Listings
              </Typography>
              <Typography
                variant={isSmallMobile ? 'subtitle1' : 'h6'}
                sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}
              >
                {activeCount ?? (loading ? <Skeleton width={50} /> : '—')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                sx={{
                  mb: { xs: 1, sm: 2 },
                  fontSize: { xs: '0.8rem', sm: '0.875rem' },
                }}
              >
                Revenue by Day
              </Typography>
              {loading ? (
                <Skeleton height={120} />
              ) : dailySeries.length === 0 ? (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontSize: { xs: '0.9rem', sm: '0.875rem' } }}
                >
                  No sales in the selected window.
                </Typography>
              ) : (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    gap: { xs: 0.5, sm: 0.75 },
                    height: { xs: 120, sm: 180 },
                    px: { xs: 0.5, sm: 1 },
                    overflowX: 'auto',
                  }}
                >
                  {dailySeries.map(s => (
                    <Tooltip
                      key={s.date}
                      title={`${s.date}: ${s.total} credits`}
                    >
                      <Box
                        sx={{
                          width: { xs: 8, sm: 10 },
                          bgcolor: 'primary.main',
                          borderRadius: 0.5,
                          height: `${Math.max(
                            4,
                            Math.round((s.total / maxDailyGross) * 100),
                          )}%`,
                          minWidth: { xs: 6, sm: 8 },
                        }}
                      />
                    </Tooltip>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                sx={{
                  mb: { xs: 1, sm: 2 },
                  fontSize: { xs: '0.8rem', sm: '0.875rem' },
                }}
              >
                Top Types
              </Typography>
              {loading ? (
                <Skeleton height={120} />
              ) : topTypes.length === 0 ? (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontSize: { xs: '0.9rem', sm: '0.875rem' } }}
                >
                  No data.
                </Typography>
              ) : (
                <Stack
                  divider={<Divider flexItem />}
                  spacing={{ xs: 0.5, sm: 1 }}
                >
                  {topTypes.map(t => (
                    <Stack
                      key={t.type}
                      direction={{ xs: 'column', sm: 'row' }}
                      justifyContent="space-between"
                      alignItems={{ xs: 'flex-start', sm: 'center' }}
                      spacing={{ xs: 0.25, sm: 0 }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ fontSize: { xs: '0.85rem', sm: '0.875rem' } }}
                      >
                        {t.type}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          fontSize: { xs: '0.8rem', sm: '0.875rem' },
                          color: { xs: 'text.secondary', sm: 'text.primary' },
                        }}
                      >
                        {t.count} sold · {t.revenue} credits
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Withdrawal Dialog */}
      <Dialog
        open={withdrawDialog.open}
        onClose={() =>
          !withdrawDialog.busy &&
          setWithdrawDialog({
            open: false,
            amount: '',
            paypalEmail: '',
            busy: false,
          })
        }
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            margin: { xs: 0, sm: 2 },
            maxHeight: { xs: '100vh', sm: 'calc(100vh - 64px)' },
          },
        }}
      >
        <DialogTitle
          sx={{
            pb: { xs: 1, sm: 2 },
            fontSize: { xs: '1.1rem', sm: '1.25rem' },
          }}
        >
          Request Withdrawal
        </DialogTitle>
        <DialogContent sx={{ px: { xs: 2, sm: 3 } }}>
          <Stack spacing={{ xs: 2, sm: 3 }} sx={{ mt: 1 }}>
            <Alert
              severity="info"
              sx={{ fontSize: { xs: '0.85rem', sm: '0.875rem' } }}
            >
              Minimum withdrawal amount is $1.00. Processing takes 1-3 business
              days.
            </Alert>

            <TextField
              label="Withdrawal Amount (USD)"
              type="number"
              fullWidth
              size={isSmallMobile ? 'medium' : 'small'}
              value={withdrawDialog.amount}
              onChange={e =>
                setWithdrawDialog({ ...withdrawDialog, amount: e.target.value })
              }
              inputProps={{
                min: 1,
                max: sellerBalance
                  ? parseFloat(sellerBalance.availableBalance)
                  : 0,
                step: 0.01,
              }}
              helperText={
                sellerBalance
                  ? `Available: ${formatUsd(
                      parseFloat(sellerBalance.availableBalance),
                    )}`
                  : ''
              }
            />

            <TextField
              label="PayPal Email"
              type="email"
              fullWidth
              size={isSmallMobile ? 'medium' : 'small'}
              value={withdrawDialog.paypalEmail}
              onChange={e =>
                setWithdrawDialog({
                  ...withdrawDialog,
                  paypalEmail: e.target.value,
                })
              }
              helperText="Enter the email address associated with your PayPal account"
            />

            <Box
              sx={{
                bgcolor: 'background.default',
                p: { xs: 1.5, sm: 2 },
                borderRadius: 1,
              }}
            >
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
              >
                • Withdrawals are processed via PayPal
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
              >
                • 10% platform fee has already been deducted
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
              >
                • You'll receive an email confirmation when processed
              </Typography>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions
          sx={{
            px: { xs: 2, sm: 3 },
            py: { xs: 2, sm: 1 },
            flexDirection: { xs: 'column', sm: 'row' },
            gap: { xs: 1, sm: 0 },
          }}
        >
          <Button
            onClick={() =>
              setWithdrawDialog({
                open: false,
                amount: '',
                paypalEmail: '',
                busy: false,
              })
            }
            disabled={withdrawDialog.busy}
            fullWidth={isMobile}
            size={isSmallMobile ? 'medium' : 'small'}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleWithdrawRequest}
            disabled={
              withdrawDialog.busy ||
              !withdrawDialog.amount ||
              !withdrawDialog.paypalEmail ||
              parseFloat(withdrawDialog.amount) < 1
            }
            fullWidth={isMobile}
            size={isSmallMobile ? 'medium' : 'small'}
            sx={{ ml: { xs: 0, sm: 1 } }}
          >
            {withdrawDialog.busy ? 'Processing...' : 'Request Withdrawal'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Recent Withdrawals */}
      {withdrawals.length > 0 && (
        <Box sx={{ mt: { xs: 3, md: 4 } }}>
          <Typography
            variant={isSmallMobile ? 'subtitle1' : 'h6'}
            fontWeight={700}
            sx={{
              mb: { xs: 1, sm: 2 },
              fontSize: { xs: '1.1rem', sm: '1.25rem' },
            }}
          >
            Recent Withdrawal Requests
          </Typography>
          <Card>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Stack spacing={{ xs: 1.5, sm: 2 }}>
                {withdrawals.slice(0, 5).map((withdrawal: any) => (
                  <Box
                    key={withdrawal.id}
                    sx={{
                      display: 'flex',
                      flexDirection: { xs: 'column', sm: 'row' },
                      justifyContent: 'space-between',
                      alignItems: { xs: 'flex-start', sm: 'center' },
                      py: { xs: 1, sm: 1 },
                      gap: { xs: 1, sm: 0 },
                    }}
                  >
                    <Box>
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        sx={{ fontSize: { xs: '0.9rem', sm: '0.875rem' } }}
                      >
                        {formatUsd(parseFloat(withdrawal.amount))} →{' '}
                        {withdrawal.paypalEmail}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontSize: { xs: '0.75rem', sm: '0.75rem' } }}
                      >
                        {new Date(withdrawal.requestedAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Chip
                      label={withdrawal.status}
                      size="small"
                      color={
                        withdrawal.status === 'completed'
                          ? 'success'
                          : withdrawal.status === 'processing'
                          ? 'warning'
                          : withdrawal.status === 'failed'
                          ? 'error'
                          : 'default'
                      }
                      sx={{
                        fontSize: { xs: '0.7rem', sm: '0.75rem' },
                        height: { xs: 24, sm: 32 },
                      }}
                    />
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Box>
      )}
    </Container>
  );
}
