import { Box, Paper, Stack, Typography } from '@mui/material';
import { GalleryStats } from '@features/gallery/components/GalleryStats';

interface GalleryHeaderProps {
    stats: {
        total: number;
        thisMonth: number;
        mostLiked: string;
    };
    showStats: boolean;
}

export const GalleryHeader = ({ stats, showStats }: GalleryHeaderProps) => {
    return (
        <Paper
            elevation={1}
            sx={{
                p: { xs: 3, sm: 4 },
                mb: 3,
                borderRadius: 3,
                background:
                    'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.9) 100%)',
                border: '1px solid rgba(0,0,0,0.08)',
            }}
        >
            <Stack
                direction={{ xs: 'column', lg: 'row' }}
                spacing={{ xs: 3, lg: 4 }}
                alignItems={{ xs: 'flex-start', lg: 'center' }}
            >
                <Box sx={{ flex: 1, width: '100%' }}>
                    <Typography
                        variant="h2"
                        component="h1"
                        sx={{
                            mb: 1,
                            fontSize: { xs: '1.75rem', sm: '2.5rem', md: '3rem' },
                            fontWeight: 700,
                            background: 'linear-gradient(45deg, #2196F3, #21CBF3)',
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            color: 'transparent',
                        }}
                    >
                        My Collection
                    </Typography>
                    <Typography
                        variant="h6"
                        color="text.secondary"
                        sx={{
                            fontWeight: 400,
                            fontSize: { xs: '1rem', sm: '1.25rem' },
                        }}
                    >
                        Organize, discover, and showcase your trading cards
                    </Typography>
                </Box>

                {showStats && <GalleryStats stats={stats} />}
            </Stack>
        </Paper>
    );
};
