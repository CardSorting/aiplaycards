/**
 * Seed Animation Templates
 * Creates default animation templates for special collection cards
 */

import { db } from '../src/db';
import { specialAnimationTemplates } from '../src/db/schema/special-animation-queue';

const defaultTemplates = [
  {
    name: 'Sparkle Magic',
    description: 'Magical sparkles dancing around the card',
    animationType: 'sparkle',
    duration: 3000,
    creditCost: 5,
    rarityFilter: null, // Available for all rarities
    isActive: true,
    isPremium: false,
    animationConfig: JSON.stringify({
      particles: 25,
      colors: ['#FFD700', '#FFA500', '#FF69B4', '#00CED1', '#98FB98'],
      intensity: 'medium',
      pattern: 'random',
    }),
  },
  {
    name: 'Golden Glow',
    description: 'Warm golden glow effect',
    animationType: 'glow',
    duration: 2500,
    creditCost: 4,
    rarityFilter: null,
    isActive: true,
    isPremium: false,
    animationConfig: JSON.stringify({
      color: '#FFD700',
      intensity: 0.8,
      pulseSpeed: 1000,
      fadePattern: 'smooth',
    }),
  },
  {
    name: 'Legendary Sparkles',
    description: 'Premium sparkle effect for legendary cards',
    animationType: 'sparkle',
    duration: 4000,
    creditCost: 8,
    rarityFilter: 'legendary',
    isActive: true,
    isPremium: true,
    animationConfig: JSON.stringify({
      particles: 40,
      colors: ['#FF6B35', '#F7931E', '#FFD700', '#FFAA00'],
      intensity: 'high',
      pattern: 'burst',
      trails: true,
    }),
  },
  {
    name: 'Mystic Rotation',
    description: 'Smooth rotation with mystical aura',
    animationType: 'rotate',
    duration: 3500,
    creditCost: 6,
    rarityFilter: null,
    isActive: true,
    isPremium: false,
    animationConfig: JSON.stringify({
      direction: 'clockwise',
      speed: 0.8,
      degrees: 360,
      aura: true,
      auraColor: '#9C27B0',
    }),
  },
  {
    name: 'Bounce & Sparkle',
    description: 'Playful bounce with sparkle effects',
    animationType: 'bounce',
    duration: 3000,
    creditCost: 7,
    rarityFilter: null,
    isActive: true,
    isPremium: false,
    animationConfig: JSON.stringify({
      height: 30,
      speed: 600,
      bounces: 3,
      sparkleOnBounce: true,
      elasticity: 0.7,
    }),
  },
  {
    name: 'Epic Glow Pulse',
    description: 'Intense pulsing glow for epic cards',
    animationType: 'glow',
    duration: 3500,
    creditCost: 7,
    rarityFilter: 'epic',
    isActive: true,
    isPremium: true,
    animationConfig: JSON.stringify({
      color: '#9C27B0',
      intensity: 1.0,
      pulseSpeed: 800,
      fadePattern: 'sharp',
      multiColor: true,
      colors: ['#9C27B0', '#E91E63', '#673AB7'],
    }),
  },
];

async function seedAnimationTemplates() {
  console.log('🎨 Seeding animation templates...');

  try {
    // Clear existing templates
    console.log('Clearing existing animation templates...');
    await db.delete(specialAnimationTemplates);

    // Insert new templates
    console.log('Inserting new animation templates...');
    const inserted = await db
      .insert(specialAnimationTemplates)
      .values(defaultTemplates)
      .returning();

    console.log(
      `✅ Successfully seeded ${inserted.length} animation templates:`,
    );
    inserted.forEach((template, index) => {
      console.log(
        `  ${index + 1}. ${template.name} (${template.animationType}) - ${
          template.creditCost
        } credits`,
      );
    });
  } catch (error) {
    console.error('❌ Failed to seed animation templates:', error);
    process.exit(1);
  }

  console.log('🎨 Animation template seeding completed!');
}

// Run if called directly
if (require.main === module) {
  seedAnimationTemplates()
    .then(() => {
      console.log('Script completed successfully');
      process.exit(0);
    })
    .catch(error => {
      console.error('Script failed:', error);
      process.exit(1);
    });
}

export { seedAnimationTemplates };
