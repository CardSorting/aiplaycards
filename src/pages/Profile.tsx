import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import {
    Alert,
    Avatar,
    Box,
    Button,
    Card,
    CardActionArea,
    CardContent,
    CardMedia,
    Chip,
    CircularProgress,
    Container,
    Grid,
    IconButton,
    Skeleton,
    Stack,
    Tab,
    Tabs,
    TextField,
    Typography,
} from '@mui/material';
import {
    Check as CheckIcon,
    Close as CloseIcon,
    Edit as EditIcon,
} from '@mui/icons-material';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
    CardData,
    CardDisplayWrapper,
    LazyCardRenderer,
    MTGCardDisplayWrapper,
    YugiohCardDisplayWrapper,
    normalizeCardData,
    useCardLoadingState,
} from '@components/CardDisplayWrapper';
import { SEO } from '@layout';
import Routes from '@routes';
import { useSession } from '@hooks/useSession';

// Reserved usernames (should match backend list)
const RESERVED_USERNAMES = new Set([
    'system', 'api', 'www', 'mail', 'ftp', 'webmaster', 'postmaster', 'hostmaster',
    'abuse', 'security', 'support', 'help', 'info', 'contact', 'sales', 'marketing',
    'billing', 'legal', 'privacy', 'terms', 'about', 'blog', 'news', 'press',
    'media', 'public', 'private', 'internal', 'external', 'static', 'assets',
    'cdn', 'cache', 'backup', 'test', 'testing', 'dev', 'development', 'staging',
    'prod', 'production', 'beta', 'alpha', 'demo', 'null', 'undefined', 'void',
    'nil', 'none', 'empty', 'blank', 'anonymous', 'guest', 'user', 'users',
    'account', 'accounts', 'profile', 'profiles', 'settings', 'config', 'configuration',
    'dashboard', 'panel', 'console', 'control', 'manage', 'management', 'gallery',
    'marketplace', 'cards', 'card', 'create', 'edit', 'delete', 'update', 'upload',
    'download', 'share', 'export', 'import', 'search', 'browse', 'view', 'show',
    'display', 'list', 'index', 'home', 'main', 'welcome', 'login', 'logout',
    'signin', 'signup', 'register', 'auth', 'oauth', 'callback', 'verify',
    'confirm', 'reset', 'forgot', 'password', 'email', 'phone', 'mobile',
    'yugioh', 'pokemon', 'tcg', 'card-game', 'booster', 'pack', 'packs',
]);

type UserCard = CardData & {
    isPublic: boolean;
    createdAt: string;
    likesCount?: number;
};

type YugiohUserCard = {
    id: number;
    cardData: Record<string, unknown>;
    imageData?: {
        dataUrl?: string;
        width?: number;
        height?: number;
    };
    createdAt: string;
    isPublic?: boolean;
};

type MTGUserCard = {
    id: number;
    name: string;
    type: string;
    rarity: 'common' | 'uncommon' | 'rare' | 'mythic';
    description?: string;
    imageData?: {
        dataUrl?: string;
        width?: number;
        height?: number;
    };
    cardEditorState?: any;
    createdAt: string;
    isPublic?: boolean;
};

type SpecialCard = {
    id: number;
    cardName: string;
    imageUrl: string;
    rarity: string;
    categoryId?: number | null;
    categoryName?: string | null;
    categoryColor?: string | null;
    claimedAt: string;
    originalSlotNumber: number;
    packClaimId: number;
};

type SpecialPackClaim = {
    id: number;
    packDisplayName: string;
    categoryId?: number | null;
    categoryName?: string | null;
    categoryColor?: string | null;
    claimedAt: string;
    totalCards: number;
    cardsReceived: number;
    status: string;
    cards: SpecialCard[];
};

const PrintOrdersTablePlaceholder = () => (
    <Box sx={{ p: 4, textAlign: 'center', border: '1px dashed grey', borderRadius: 2 }}>
        <Typography variant="h6" color="text.secondary">
            Print Orders Not Available in this View
        </Typography>
        <Typography variant="body2" color="text.secondary">
            This feature is currently being migrated.
        </Typography>
    </Box>
);

const UserProfilePage = () => {
    const params = useParams<{ username: string }>();
    const navigate = useNavigate();
    const { data: session } = useSession();
    const authUser = session?.user;
    const username = params.username || '';

    const [profile, setProfile] = useState<{
        userId: string;
        username: string;
        createdAt?: string;
        followers?: number;
        following?: number;
        isFollowing?: boolean;
        avatarUrl?: string;
    } | null>(null);
    const [collection, setCollection] = useState<UserCard[]>([]);
    const [yugiohCollection, setYugiohCollection] = useState<YugiohUserCard[]>([]);
    const [mtgCollection, setMtgCollection] = useState<MTGUserCard[]>([]);
    const [specialCollection, setSpecialCollection] = useState<SpecialPackClaim[]>([]);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [loadingCollection, setLoadingCollection] = useState(false);
    const [loadingYugiohCollection, setLoadingYugiohCollection] = useState(false);
    const [loadingMtgCollection, setLoadingMtgCollection] = useState(false);
    const [loadingSpecialCollection, setLoadingSpecialCollection] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [redirecting, setRedirecting] = useState(false);
    const [collectionPage, setCollectionPage] = useState(0);
    const [collectionHasMore, setCollectionHasMore] = useState(true);
    const [totalCollection, setTotalCollection] = useState(0);
    const [totalYugiohCards, setTotalYugiohCards] = useState(0);
    const [totalMtgCards, setTotalMtgCards] = useState(0);
    const [totalSpecialCards, setTotalSpecialCards] = useState(0);
    const [activeTab, setActiveTab] = useState(0);
    const [isEditingUsername, setIsEditingUsername] = useState(false);
    const [newUsername, setNewUsername] = useState('');
    const [usernameError, setUsernameError] = useState('');
    const [updatingUsername, setUpdatingUsername] = useState(false);
    const [communityCards, setCommunityCards] = useState<UserCard[]>([]);
    const [loadingCommunityCards, setLoadingCommunityCards] = useState(false);
    const [totalCommunityCards, setTotalCommunityCards] = useState(0);
    const [communityLikes, setCommunityLikes] = useState(0);
    const collectionObserver = useRef<IntersectionObserver>();

    const { handleCardLoad, isCardLoaded } = useCardLoadingState();

    const specialCategories = useMemo(() => {
        if (!specialCollection.length) return [];
        const categoryMap = new Map<string, { id: number | null, name: string, color: string | null, cards: SpecialCard[] }>();
        categoryMap.set('uncategorized', { id: null, name: 'Uncategorized', color: null, cards: [] });

        specialCollection.forEach(pack => {
            pack.cards.forEach(card => {
                const categoryKey = card.categoryId?.toString() || 'uncategorized';
                const categoryName = card.categoryName || 'Uncategorized';
                const categoryColor = card.categoryColor || '#1976d2';
                if (!categoryMap.has(categoryKey)) {
                    categoryMap.set(categoryKey, { id: card.categoryId || null, name: categoryName, color: categoryColor, cards: [] });
                }
                categoryMap.get(categoryKey)!.cards.push(card);
            });
        });
        if (categoryMap.get('uncategorized')?.cards.length === 0) categoryMap.delete('uncategorized');
        return Array.from(categoryMap.values()).sort((a, b) => {
            if (a.name === 'Uncategorized') return 1;
            if (b.name === 'Uncategorized') return -1;
            return a.name.localeCompare(b.name);
        });
    }, [specialCollection]);

    const isOwnProfile = useMemo(() => authUser && profile && authUser.id === profile.userId, [authUser, profile]);

    const profileName = useMemo(() => {
        if (profile?.username) return `@${profile.username}`;
        if (isOwnProfile) return (authUser?.name || authUser?.email || '').toString();
        if (profile?.userId) return `User ${profile.userId.slice(0, 8)}`;
        return '';
    }, [authUser, profile?.username, profile?.userId, isOwnProfile]);

    const avatarLetter = useMemo(() => {
        const letter = isOwnProfile
            ? authUser?.name?.[0] || authUser?.email?.[0] || profile?.username?.[0] || profile?.userId?.[0]
            : profile?.username?.[0] || profile?.userId?.[0];
        return (letter || '?').toUpperCase();
    }, [profile, isOwnProfile, authUser]);

    const avatarSrc = useMemo(() => profile?.avatarUrl || (isOwnProfile ? authUser?.image : null) || null, [profile?.avatarUrl, isOwnProfile, authUser?.image]);

    const shareUrl = useMemo(() => {
        if (!profile) return '';
        const handle = profile.username || profile.userId;
        if (!handle) return '';
        return `${window.location.origin}${Routes.Profile(handle)}`;
    }, [profile?.username, profile?.userId]);

    const shareProfile = useCallback(async () => {
        if (!shareUrl) return;
        const title = profile?.username ? `@${profile.username} on PlayMoreTCG` : 'My PlayMoreTCG profile';
        const text = 'Check out my collection on PlayMoreTCG';
        try {
            if (navigator.share) {
                await navigator.share({ title, text, url: shareUrl });
            } else if (navigator.clipboard) {
                await navigator.clipboard.writeText(shareUrl);
                alert('Profile link copied to clipboard');
            }
        } catch { }
    }, [shareUrl, profile?.username]);

    const validateUsername = useCallback((username: string): string => {
        if (!username.trim()) return 'Username is required';
        if (username.length < 3) return 'Username must be at least 3 characters';
        if (username.length > 30) return 'Username must be less than 30 characters';
        if (!/^[a-zA-Z0-9\-_.]+$/.test(username)) return 'Username can only contain letters, numbers, hyphens, underscores, and periods';
        if (/^[.\-_]/.test(username) || /[.\-_]$/.test(username)) return 'Username cannot start or end with special characters';
        if (RESERVED_USERNAMES.has(username.toLowerCase())) return 'This username is reserved and cannot be used';
        return '';
    }, []);

    const startEditingUsername = useCallback(() => {
        setNewUsername(profile?.username || '');
        setUsernameError('');
        setIsEditingUsername(true);
    }, [profile?.username]);

    const cancelEditingUsername = useCallback(() => {
        setIsEditingUsername(false);
        setNewUsername('');
        setUsernameError('');
    }, []);

    const updateUsername = useCallback(async () => {
        if (!profile || !newUsername.trim()) return;
        const validationError = validateUsername(newUsername.trim());
        if (validationError) {
            setUsernameError(validationError);
            return;
        }
        setUpdatingUsername(true);
        setUsernameError('');
        try {
            const res = await fetch(`/api/users/profile/${encodeURIComponent(profile.username || profile.userId)}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: newUsername.trim() }),
            });
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to update username');
            }
            const data = await res.json();
            setProfile(prev => prev ? { ...prev, username: data.data.username } : prev);
            setIsEditingUsername(false);
            setNewUsername('');
            if (data.data.username && data.data.username !== username) {
                navigate(Routes.Profile(data.data.username));
            }
        } catch (e) {
            setUsernameError(e instanceof Error ? e.message : 'Failed to update username');
        } finally {
            setUpdatingUsername(false);
        }
    }, [profile, newUsername, validateUsername, username, navigate]);

    useEffect(() => {
        let active = true;
        async function loadProfile() {
            setLoadingProfile(true);
            setError(null);
            try {
                const res = await fetch(`/api/users/profile/${encodeURIComponent(username)}`);
                if (!res.ok) throw new Error(res.status === 404 ? 'User not found' : 'Failed to load user');
                const data = await res.json();
                if (!active) return;
                const canonical = data?.data?.username as string | null;
                const urlFriendlyCanonical = canonical?.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9\-_.]/g, '').toLowerCase();
                if (canonical && username !== urlFriendlyCanonical) {
                    setRedirecting(true);
                    navigate(Routes.Profile(canonical), { replace: true });
                    return;
                }
                setProfile(data.data);
            } catch (e) {
                if (active) setError(e instanceof Error ? e.message : 'Failed to load user');
            } finally {
                if (active) setLoadingProfile(false);
            }
        }
        if (username) loadProfile();
        return () => { active = false; };
    }, [username, navigate]);

    const fetchCollection = useCallback(async () => {
        if (redirecting || !profile || !collectionHasMore) return;
        setLoadingCollection(true);
        try {
            const limit = 24;
            const res = await fetch(`/api/cards?userId=${encodeURIComponent(profile.userId)}&isPublic=true&limit=${limit}&offset=${collectionPage * limit}&view=summary`);
            if (!res.ok) throw new Error('Failed to load collection');
            const json = await res.json();
            const rows: UserCard[] = Array.isArray(json?.data) ? json.data.map((item: any) => {
                const normalized = normalizeCardData(item);
                return {
                    ...normalized,
                    id: item.id,
                    supertype: normalized.supertype || item.cardSupertype || 'Monster',
                    type: normalized.type || item.cardType || 'Colorless',
                    name: normalized.name || item.cardName || 'Unknown Card',
                    isPublic: item.isPublic,
                    createdAt: item.createdAt,
                };
            }) : [];
            setCollection(prev => {
                const existing = new Set(prev.map(c => c.id));
                const fresh = rows.filter(c => !existing.has(c.id));
                return [...prev, ...fresh];
            });
            setTotalCollection(Number(json?.total || 0));
            setCollectionHasMore(rows.length === limit);
            setCollectionPage(p => p + 1);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to load collection');
        } finally {
            setLoadingCollection(false);
        }
    }, [profile, collectionPage, collectionHasMore, redirecting]);

    const fetchYugiohCollection = useCallback(async () => {
        if (redirecting || !profile) return;
        setLoadingYugiohCollection(true);
        try {
            const res = await fetch(`/api/yugioh-cards?userId=${encodeURIComponent(profile.userId)}&limit=100`);
            if (!res.ok) throw new Error('Failed to load Yugioh collection');
            const json = await res.json();
            const cards: YugiohUserCard[] = Array.isArray(json?.cards) ? json.cards : [];
            setYugiohCollection(cards);
            setTotalYugiohCards(cards.length);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to load Yugioh collection');
        } finally {
            setLoadingYugiohCollection(false);
        }
    }, [profile, redirecting]);

    const fetchMtgCollection = useCallback(async () => {
        if (redirecting || !profile) return;
        setLoadingMtgCollection(true);
        try {
            const res = await fetch(`/api/mtg-cards?userId=${encodeURIComponent(profile.userId)}&limit=100`);
            if (!res.ok) throw new Error('Failed to load MTG collection');
            const json = await res.json();
            const cards: MTGUserCard[] = Array.isArray(json?.data) ? json.data : [];
            setMtgCollection(cards);
            setTotalMtgCards(cards.length);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to load MTG collection');
        } finally {
            setLoadingMtgCollection(false);
        }
    }, [profile, redirecting]);

    const fetchSpecialCollection = useCallback(async () => {
        if (redirecting || !profile) return;
        setLoadingSpecialCollection(true);
        try {
            const res = await fetch(`/api/users/${encodeURIComponent(profile.userId)}/special-collection`);
            if (!res.ok) throw new Error('Failed to load special collection');
            const json = await res.json();
            const specialPacks: SpecialPackClaim[] = Array.isArray(json?.collection) ? json.collection : [];
            setSpecialCollection(specialPacks);
            const totalCards = specialPacks.reduce((sum, pack) => sum + pack.cards.length, 0);
            setTotalSpecialCards(totalCards);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to load special collection');
        } finally {
            setLoadingSpecialCollection(false);
        }
    }, [profile, redirecting]);

    const fetchCommunityCards = useCallback(async () => {
        if (redirecting || !profile) return;
        setLoadingCommunityCards(true);
        try {
            const up = new URLSearchParams({ userId: profile.userId, packSlug: 'community', isPublic: 'true' });
            const res = await fetch(`/api/community/cards?${up}`);
            if (!res.ok) throw new Error('Failed to load community cards');
            const json = await res.json();
            const cards: UserCard[] = Array.isArray(json?.cards) ? json.cards.map((item: any) => {
                const normalized = normalizeCardData(item);
                return {
                    ...normalized,
                    id: item.id,
                    supertype: normalized.supertype || item.supertype || 'Monster',
                    type: normalized.type || item.type || 'Colorless',
                    name: normalized.name || item.name || 'Unknown Card',
                    isPublic: true,
                    createdAt: item.createdAt,
                };
            }) : [];
            setCommunityCards(cards);
            setTotalCommunityCards(cards.length);
            setCommunityLikes(cards.reduce((sum, card) => sum + (card.likesCount || 0), 0));
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to load community cards');
        } finally {
            setLoadingCommunityCards(false);
        }
    }, [profile, redirecting]);

    useEffect(() => {
        if (profile) {
            setCollection([]);
            setYugiohCollection([]);
            setMtgCollection([]);
            setSpecialCollection([]);
            setCollectionPage(0);
            setCollectionHasMore(true);
            setTotalCollection(0);
            setTotalYugiohCards(0);
            setTotalMtgCards(0);
            setTotalSpecialCards(0);
        }
    }, [profile?.userId]);

    useEffect(() => { if (!redirecting && profile && activeTab === 0) fetchCollection(); }, [profile, redirecting, fetchCollection, activeTab]);
    useEffect(() => { if (!redirecting && profile && activeTab === 1) fetchYugiohCollection(); }, [profile, redirecting, fetchYugiohCollection, activeTab]);
    useEffect(() => { if (!redirecting && profile && activeTab === 2) fetchCommunityCards(); }, [profile, redirecting, fetchCommunityCards, activeTab]);
    useEffect(() => { if (!redirecting && profile && activeTab === 3) { fetchMtgCollection(); fetchSpecialCollection(); } }, [profile, redirecting, fetchMtgCollection, fetchSpecialCollection, activeTab]);

    const collectionLastItemRef = useCallback((node: HTMLElement | null) => {
        if (loadingCollection) return;
        if (collectionObserver.current) collectionObserver.current.disconnect();
        collectionObserver.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && collectionHasMore) {
                fetchCollection();
            }
        });
        if (node) collectionObserver.current.observe(node);
    }, [loadingCollection, collectionHasMore, fetchCollection]);

    return (
        <>
            <SEO
                title={profile?.username ? `@${profile.username} • Store` : 'Seller Store'}
                description="Browse this seller's active marketplace listings."
            />
            <Box sx={{ background: 'linear-gradient(135deg, #f6f9fc, #eef2f7)', borderBottom: '1px solid #e5eaf2' }}>
                <Container maxWidth="xl" sx={{ py: 4 }}>
                    <Stack direction={{ xs: 'column', md: 'row' }} alignItems={{ xs: 'flex-start', md: 'center' }} spacing={3}>
                        {loadingProfile ? (
                            <Skeleton variant="circular" width={80} height={80} />
                        ) : (
                            <Avatar sx={{ width: 80, height: 80, fontSize: 32 }} src={avatarSrc || undefined}>
                                {avatarLetter}
                            </Avatar>
                        )}
                        <Box sx={{ flex: 1 }}>
                            {loadingProfile ? (
                                <Skeleton variant="text" width={200} height={48} />
                            ) : isOwnProfile && isEditingUsername ? (
                                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                                    <TextField value={newUsername} onChange={e => { setNewUsername(e.target.value); if (usernameError) setUsernameError(''); }} placeholder="Enter username" size="small" error={!!usernameError} helperText={usernameError} disabled={updatingUsername} sx={{ minWidth: 200 }} onKeyPress={e => { if (e.key === 'Enter') updateUsername(); if (e.key === 'Escape') cancelEditingUsername(); }} autoFocus />
                                    <IconButton onClick={updateUsername} disabled={updatingUsername || !newUsername.trim()} color="primary" size="small">
                                        {updatingUsername ? <CircularProgress size={20} /> : <CheckIcon />}
                                    </IconButton>
                                    <IconButton onClick={cancelEditingUsername} disabled={updatingUsername} color="secondary" size="small">
                                        <CloseIcon />
                                    </IconButton>
                                </Stack>
                            ) : (
                                <Stack direction="row" alignItems="center" spacing={1}>
                                    <Typography variant="h4" sx={{ fontWeight: 800 }}>
                                        {profileName || (username ? `@${username}` : 'Profile')}
                                    </Typography>
                                    {isOwnProfile && !loadingProfile && (
                                        <IconButton onClick={startEditingUsername} size="small" sx={{ ml: 1 }}>
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                    )}
                                </Stack>
                            )}
                            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                                {loadingProfile ? (
                                    <>
                                        <Skeleton variant="rounded" width={120} height={24} />
                                        <Skeleton variant="rounded" width={140} height={24} />
                                    </>
                                ) : (
                                    <>
                                        <Chip label={`${totalCollection} monster cards`} size="small" />
                                        {totalYugiohCards > 0 && <Chip label={`${totalYugiohCards} duel cards`} size="small" color="primary" />}
                                        {profile?.followers !== undefined && <Chip label={`${profile.followers} followers`} size="small" />}
                                    </>
                                )}
                            </Stack>
                        </Box>
                        {!loadingProfile && (isOwnProfile ? (
                            <Button variant="contained" onClick={shareProfile}>Share Profile</Button>
                        ) : (
                            <Button variant={profile?.isFollowing ? 'outlined' : 'contained'} onClick={async () => {
                                if (!profile) return;
                                try {
                                    const res = await fetch(`/api/users/profile/${encodeURIComponent(profile.username || profile.userId)}`, {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ action: profile.isFollowing ? 'unfollow' : 'follow' }),
                                    });
                                    if (!res.ok) return;
                                    const data = await res.json();
                                    setProfile(p => p ? { ...p, followers: data?.data?.followers ?? p.followers, following: data?.data?.following ?? p.following, isFollowing: data?.data?.isFollowing ?? p.isFollowing } : p);
                                } catch { }
                            }}>{profile?.isFollowing ? 'Following' : 'Follow'}</Button>
                        ))}
                    </Stack>
                </Container>
            </Box>

            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Container maxWidth="xl">
                    <Tabs value={activeTab} onChange={(_, nv) => setActiveTab(nv)} aria-label="profile tabs" variant="scrollable" scrollButtons="auto">
                        <Tab label="Monster Collection" />
                        <Tab label="Duel Collection" />
                        <Tab label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>Community Gallery{totalCommunityCards > 0 && <Chip label={totalCommunityCards} size="small" color="info" />}</Box>} />
                        <Tab label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>Spells & Special{(totalMtgCards + totalSpecialCards) > 0 && <Chip label={totalMtgCards + totalSpecialCards} size="small" color="error" />}</Box>} />
                        {isOwnProfile && <Tab label="Print Orders" />}
                    </Tabs>
                </Container>
            </Box>

            <Container maxWidth="xl" sx={{ py: 4 }}>
                {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
                {activeTab === 0 && (
                    <Grid container spacing={3}>
                        {collection.map((c, index) => (
                            <Grid item xs={12} sm={6} md={4} lg={3} key={c.id} ref={index === collection.length - 1 ? (collectionLastItemRef as any) : undefined}>
                                <LazyCardRenderer card={c} isLoaded={isCardLoaded(c.id)} onLoad={() => handleCardLoad(c.id)}>
                                    <Card>
                                        <CardActionArea component={Link} to={`/gallery/${c.id}`}>
                                            <Box sx={{ p: 2, bgcolor: '#f8f9fa', display: 'flex', justifyContent: 'center' }}>
                                                <CardDisplayWrapper card={c} width="responsive" />
                                            </Box>
                                            <CardContent>
                                                <Typography variant="subtitle1" fontWeight={700} noWrap>{c.name}</Typography>
                                                <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}><Chip size="small" label={c.type} />{c.rarity && <Chip size="small" variant="outlined" label={c.rarity} />}</Stack>
                                            </CardContent>
                                        </CardActionArea>
                                    </Card>
                                </LazyCardRenderer>
                            </Grid>
                        ))}
                    </Grid>
                )}
                {activeTab === 1 && (
                    <Grid container spacing={3}>
                        {yugiohCollection.map(card => (
                            <Grid item xs={12} sm={6} md={4} lg={3} key={card.id}>
                                <Card>
                                    <CardActionArea component={Link} to={`/duel-gallery/${card.id}`}>
                                        <Box sx={{ p: 2, bgcolor: '#f8f9fa', display: 'flex', justifyContent: 'center' }}>
                                            <YugiohCardDisplayWrapper cardData={card.cardData} width={280} height={390} showFrame={true} />
                                        </Box>
                                        <CardContent>
                                            <Typography variant="subtitle1" fontWeight={700} noWrap>{(card.cardData as any)?.cardTitle || 'Untitled Card'}</Typography>
                                        </CardContent>
                                    </CardActionArea>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                )}
                {activeTab === 2 && (
                    <Grid container spacing={3}>
                        {communityCards.map(card => (
                            <Grid item xs={12} sm={6} md={4} lg={3} key={card.id}>
                                <LazyCardRenderer card={card} isLoaded={isCardLoaded(card.id)} onLoad={() => handleCardLoad(card.id)}>
                                    <Card>
                                        <CardActionArea component={Link} to={`/gallery/${card.id}`}>
                                            <Box sx={{ p: 2, bgcolor: '#f8f9fa', display: 'flex', justifyContent: 'center' }}>
                                                <CardDisplayWrapper card={card} width="responsive" />
                                            </Box>
                                            <CardContent>
                                                <Typography variant="subtitle1" fontWeight={700} noWrap>{card.name}</Typography>
                                                <Typography variant="caption" color="text.secondary">{card.likesCount} likes</Typography>
                                            </CardContent>
                                        </CardActionArea>
                                    </Card>
                                </LazyCardRenderer>
                            </Grid>
                        ))}
                    </Grid>
                )}
                {activeTab === 3 && (
                    <Box>
                        {mtgCollection.length > 0 && (
                            <Box sx={{ mb: 6 }}>
                                <Typography variant="h5" sx={{ mb: 3, fontWeight: 700 }}>Spell Cards</Typography>
                                <Grid container spacing={3}>
                                    {mtgCollection.map(card => (
                                        <Grid item xs={12} sm={6} md={4} lg={3} key={card.id}>
                                            <Card>
                                                <CardActionArea component={Link} to={`/spell-gallery/${card.id}`}>
                                                    <Box sx={{ p: 2, bgcolor: '#f8f9fa', display: 'flex', justifyContent: 'center' }}>
                                                        <MTGCardDisplayWrapper card={card as any} width="responsive" />
                                                    </Box>
                                                    <CardContent>
                                                        <Typography variant="subtitle1" fontWeight={700}>{card.name}</Typography>
                                                    </CardContent>
                                                </CardActionArea>
                                            </Card>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Box>
                        )}
                        {specialCategories.map(category => (
                            <Box key={category.id || 'uncategorized'} sx={{ mb: 4 }}>
                                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>{category.name}</Typography>
                                <Grid container spacing={2}>
                                    {category.cards.map(card => (
                                        <Grid item xs={12} sm={6} md={4} lg={3} key={card.id}>
                                            <Card>
                                                <CardActionArea component={Link} to={`/special-collection/card/${card.id}`}>
                                                    <CardMedia component="img" height="200" image={card.imageUrl} alt={card.cardName} sx={{ objectFit: 'cover' }} />
                                                    <CardContent><Typography variant="subtitle2" fontWeight={700}>{card.cardName}</Typography></CardContent>
                                                </CardActionArea>
                                            </Card>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Box>
                        ))}
                    </Box>
                )}
                {activeTab === 4 && <PrintOrdersTablePlaceholder />}
            </Container>
        </>
    );
};

export default UserProfilePage;
