import { FC, lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import RootLayout from './layout/RootLayout';

// Lazy load pages for better performance
const Home = lazy(() => import('./pages/Home'));
const BoosterPack = lazy(() => import('./pages/BoosterPack'));
const Gallery = lazy(() => import('./pages/Gallery'));
const SocialFeed = lazy(() => import('./pages/SocialFeed'));
const Profile = lazy(() => import('./pages/Profile'));
const Creator = lazy(() => import('./pages/Creator'));
const Marketplace = lazy(() => import('./pages/Marketplace'));
const Community = lazy(() => import('./pages/Community'));
const SpecialPacks = lazy(() => import('./pages/SpecialPacks'));
const Notifications = lazy(() => import('./pages/Notifications'));
const Credits = lazy(() => import('./pages/Credits'));
const MarketplaceCheckout = lazy(() => import('./pages/MarketplaceCheckout'));
const ListingDetail = lazy(() => import('./pages/ListingDetail'));
const ManageListings = lazy(() => import('./pages/ManageListings'));
const CreateListing = lazy(() => import('./pages/CreateListing'));
const CreatePack = lazy(() => import('./pages/CreatePack'));




// Placeholder components for routes not yet migrated
const Placeholder: FC<{ name: string }> = ({ name }) => (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>{name} Page</h1>
        <p>This page is currently being migrated from Next.js to React.</p>
    </div>
);

const App: FC = () => {
    return (
        <Routes>
            <Route path="/" element={<RootLayout />}>
                <Route index element={
                    <Suspense fallback={<div>Loading...</div>}>
                        <Home />
                    </Suspense>
                } />

                {/* Placeholder routes for ongoing migration */}
                <Route path="create" element={
                    <Suspense fallback={<div>Loading...</div>}>
                        <Creator />
                    </Suspense>
                } />
                <Route path="booster/:slug" element={
                    <Suspense fallback={<div>Loading...</div>}>
                        <BoosterPack />
                    </Suspense>
                } />

                <Route path="gallery" element={
                    <Suspense fallback={<div>Loading...</div>}>
                        <Gallery />
                    </Suspense>
                } />

                <Route path="feed" element={
                    <Suspense fallback={<div>Loading...</div>}>
                        <SocialFeed />
                    </Suspense>
                } />

                <Route path="u/:username" element={
                    <Suspense fallback={<div>Loading...</div>}>
                        <Profile />
                    </Suspense>
                } />
                <Route path="special-packs" element={
                    <Suspense fallback={<div>Loading...</div>}>
                        <SpecialPacks />
                    </Suspense>
                } />
                <Route path="special-packs/:category" element={<Placeholder name="Special Pack Category" />} />
                <Route path="marketplace" element={
                    <Suspense fallback={<div>Loading...</div>}>
                        <Marketplace />
                    </Suspense>
                } />
                <Route path="marketplace/:category" element={<Placeholder name="Marketplace Category" />} />
                <Route path="community" element={
                    <Suspense fallback={<div>Loading...</div>}>
                        <Community />
                    </Suspense>
                } />
                <Route path="notifications" element={
                    <Suspense fallback={<div>Loading...</div>}>
                        <Notifications />
                    </Suspense>
                } />
                <Route path="credits" element={
                    <Suspense fallback={<div>Loading...</div>}>
                        <Credits />
                    </Suspense>
                } />
                <Route path="marketplace/:id" element={
                    <Suspense fallback={<div>Loading...</div>}>
                        <ListingDetail />
                    </Suspense>
                } />
                <Route path="marketplace/manage/listings" element={
                    <Suspense fallback={<div>Loading...</div>}>
                        <ManageListings />
                    </Suspense>
                } />
                <Route path="marketplace/manage/create" element={
                    <Suspense fallback={<div>Loading...</div>}>
                        <CreateListing />
                    </Suspense>
                } />
                <Route path="gallery/create-pack" element={
                    <Suspense fallback={<div>Loading...</div>}>
                        <CreatePack />
                    </Suspense>
                } />
                <Route path="checkout/marketplace/:listingId" element={
                    <Suspense fallback={<div>Loading...</div>}>
                        <MarketplaceCheckout />
                    </Suspense>
                } />
                <Route path="signin" element={<Placeholder name="Sign In" />} />

                {/* 404 Route */}
                <Route path="*" element={<Placeholder name="Not Found" />} />
            </Route>
        </Routes>
    );
};

export default App;
