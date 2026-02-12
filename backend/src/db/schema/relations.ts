import { relations } from 'drizzle-orm';
import { cards } from './cards';
import { collectionCards, collections } from './collections';
import { users } from './users';
import {
  cardComments,
  cardLikes,
  cardRatings,
  collectionComments,
  collectionFollows,
  collectionLikes,
  collectionRatings,
} from './card-social';
import { marketplaceListings } from './marketplace';
import { notifications } from './notifications';
import { follows } from './follows';
import { creditTransactions } from './credit-transactions';

// Define relationships for crds table
export const cardsRelations = relations(cards, ({ many }) => ({
  collectionCards: many(collectionCards),
  likes: many(cardLikes),
  comments: many(cardComments),
  ratings: many(cardRatings),
}));

// Define relationships for collections table
export const collectionsRelations = relations(collections, ({ many }) => ({
  collectionCards: many(collectionCards),
  likes: many(collectionLikes),
  comments: many(collectionComments),
  ratings: many(collectionRatings),
  follows: many(collectionFollows),
}));

// Define relationships for collection_cards junction table
export const collectionCardsRelations = relations(
  collectionCards,
  ({ one }) => ({
    card: one(cards, {
      fields: [collectionCards.cardId],
      references: [cards.id],
    }),
    collection: one(collections, {
      fields: [collectionCards.collectionId],
      references: [collections.id],
    }),
    user: one(users, {
      fields: [collectionCards.userId],
      references: [users.userId],
    }),
  }),
);

// Define relationships for users table
export const usersRelations = relations(users, ({ many }) => ({
  collections: many(collections),
  collectionCards: many(collectionCards),
  cardLikes: many(cardLikes),
  cardComments: many(cardComments),
  cardRatings: many(cardRatings),
  collectionLikes: many(collectionLikes),
  collectionComments: many(collectionComments),
  collectionRatings: many(collectionRatings),
  collectionFollows: many(collectionFollows),
  marketplaceListingsAsSeller: many(marketplaceListings, {
    relationName: 'sellerListings',
  }),
  marketplaceListingsAsBuyer: many(marketplaceListings, {
    relationName: 'buyerListings',
  }),
  marketplaceListingsAsModerator: many(marketplaceListings, {
    relationName: 'moderatorListings',
  }),
  sentNotifications: many(notifications, {
    relationName: 'sentNotifications',
  }),
  receivedNotifications: many(notifications, {
    relationName: 'receivedNotifications',
  }),
  followers: many(follows, {
    relationName: 'followers',
  }),
  following: many(follows, {
    relationName: 'following',
  }),
  creditTransactions: many(creditTransactions),
}));

// Define relationships for card likes table
export const cardLikesRelations = relations(cardLikes, ({ one }) => ({
  card: one(cards, {
    fields: [cardLikes.cardId],
    references: [cards.id],
  }),
  user: one(users, {
    fields: [cardLikes.userId],
    references: [users.userId],
  }),
}));

// Define relationships for card comments table
export const cardCommentsRelations = relations(cardComments, ({ one }) => ({
  card: one(cards, {
    fields: [cardComments.cardId],
    references: [cards.id],
  }),
  user: one(users, {
    fields: [cardComments.userId],
    references: [users.userId],
  }),
}));

// Define relationships for card ratings table
export const cardRatingsRelations = relations(cardRatings, ({ one }) => ({
  card: one(cards, {
    fields: [cardRatings.cardId],
    references: [cards.id],
  }),
  user: one(users, {
    fields: [cardRatings.userId],
    references: [users.userId],
  }),
}));

// Define relationships for marketplace listings table
export const marketplaceListingsRelations = relations(
  marketplaceListings,
  ({ one }) => ({
    seller: one(users, {
      fields: [marketplaceListings.sellerUserId],
      references: [users.userId],
      relationName: 'sellerListings',
    }),
    buyer: one(users, {
      fields: [marketplaceListings.buyerUserId],
      references: [users.userId],
      relationName: 'buyerListings',
    }),
    moderator: one(users, {
      fields: [marketplaceListings.moderatedBy],
      references: [users.userId],
      relationName: 'moderatorListings',
    }),
  }),
);

// Define relationships for notifications table
export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.userId],
    relationName: 'receivedNotifications',
  }),
  fromUser: one(users, {
    fields: [notifications.fromUserId],
    references: [users.userId],
    relationName: 'sentNotifications',
  }),
  card: one(cards, {
    fields: [notifications.cardId],
    references: [cards.id],
  }),
  listing: one(marketplaceListings, {
    fields: [notifications.listingId],
    references: [marketplaceListings.id],
  }),
}));

// Define relationships for follows table (self-referencing)
export const followsRelations = relations(follows, ({ one }) => ({
  follower: one(users, {
    fields: [follows.followerUserId],
    references: [users.userId],
    relationName: 'followers',
  }),
  following: one(users, {
    fields: [follows.followingUserId],
    references: [users.userId],
    relationName: 'following',
  }),
}));

// Define relationships for credit transactions table
export const creditTransactionsRelations = relations(
  creditTransactions,
  ({ one }) => ({
    user: one(users, {
      fields: [creditTransactions.userId],
      references: [users.userId],
    }),
  }),
);

// Define relationships for collection likes table
export const collectionLikesRelations = relations(
  collectionLikes,
  ({ one }) => ({
    collection: one(collections, {
      fields: [collectionLikes.collectionId],
      references: [collections.id],
    }),
    user: one(users, {
      fields: [collectionLikes.userId],
      references: [users.userId],
    }),
  }),
);

// Define relationships for collection comments table
export const collectionCommentsRelations = relations(
  collectionComments,
  ({ one }) => ({
    collection: one(collections, {
      fields: [collectionComments.collectionId],
      references: [collections.id],
    }),
    user: one(users, {
      fields: [collectionComments.userId],
      references: [users.userId],
    }),
  }),
);

// Define relationships for collection ratings table
export const collectionRatingsRelations = relations(
  collectionRatings,
  ({ one }) => ({
    collection: one(collections, {
      fields: [collectionRatings.collectionId],
      references: [collections.id],
    }),
    user: one(users, {
      fields: [collectionRatings.userId],
      references: [users.userId],
    }),
  }),
);

// Define relationships for collection follows table
export const collectionFollowsRelations = relations(
  collectionFollows,
  ({ one }) => ({
    collection: one(collections, {
      fields: [collectionFollows.collectionId],
      references: [collections.id],
    }),
    user: one(users, {
      fields: [collectionFollows.userId],
      references: [users.userId],
    }),
  }),
);
