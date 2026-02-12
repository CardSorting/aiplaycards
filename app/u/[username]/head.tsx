import { userQueries } from '../../../src/db/queries/users';
import { dbUtils } from '../../../src/db/utils';
import { generateBreadcrumbStructuredData } from '../../../src/utils/seo';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://playmoretcg.com';

export default async function Head(context: {
  params: Promise<{ username: string }>;
}) {
  const params = await context.params;
  const username = params.username;
  let title = 'User Profile | PlayMore TCG';
  let description = 'View user profile and card collection on PlayMore TCG.';
  let image: string | undefined = undefined;
  let user: any = null;
  let structuredData: any = null;

  try {
    dbUtils.validateEnv();
    user = await userQueries.getByUsername(username);
    if (user) {
      title = `${user.username} - Profile | PlayMore TCG`;
      description = `View ${user.username}'s profile and card collection on PlayMore TCG. Browse their custom monster cards and trading card creations.`;
      image = user.avatarUrl || `${SITE_URL}/assets/images/metaImage.png`;

      // Generate structured data for the user profile
      structuredData = {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: user.username,
        url: `${SITE_URL}/u/${username}`,
        image: image,
        description: `Monster card creator and collector on PlayMore TCG`,
        ...(user.createdAt && { birthDate: user.createdAt }),
        ...(user.avatarUrl && { image: user.avatarUrl }),
      };

      // Generate breadcrumb structured data
      const breadcrumbData = generateBreadcrumbStructuredData({
        items: [
          { name: 'Home', url: SITE_URL },
          { name: 'Users', url: `${SITE_URL}/gallery` },
          { name: user.username, url: `${SITE_URL}/u/${username}` },
        ],
      });

      structuredData = [structuredData, breadcrumbData];
    }
  } catch {}

  const url = `${SITE_URL}/u/${username}`;
  const ogImage = image || `${SITE_URL}/assets/images/metaImage.png`;

  // Enhanced keywords based on user data
  const keywords = user
    ? [
        user.username,
        'Monster card creator',
        'custom cards',
        'trading cards',
        'card collection',
        'PlayMore TCG',
        'user profile',
      ]
        .filter(Boolean)
        .join(', ')
    : 'Monster cards, custom cards, trading cards, PlayMore TCG, user profile';

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={user?.username || 'PlayMore TCG'} />
      <meta name="robots" content="index, follow" />
      <meta name="language" content="English" />

      <link rel="canonical" href={url} />

      {/* Open Graph */}
      <meta property="og:type" content="profile" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content="PlayMore TCG" />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta
        property="og:image:alt"
        content={`${user?.username || 'User'} profile - PlayMore TCG`}
      />
      <meta property="og:locale" content="en_US" />

      {/* Profile-specific Open Graph tags */}
      {user && (
        <>
          <meta property="profile:username" content={user.username} />
          <meta property="profile:first_name" content={user.username} />
        </>
      )}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      <meta
        name="twitter:image:alt"
        content={`${user?.username || 'User'} profile - PlayMore TCG`}
      />
      <meta name="twitter:site" content="@playmoretcg" />
      <meta name="twitter:creator" content="@playmoretcg" />

      {/* Structured Data */}
      {structuredData && (
        <>
          {Array.isArray(structuredData) ? (
            structuredData.map((data, index) => (
              <script
                key={index}
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                  __html: JSON.stringify(data),
                }}
              />
            ))
          ) : (
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify(structuredData),
              }}
            />
          )}
        </>
      )}
    </>
  );
}
