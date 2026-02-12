# MTG Card Editor

A comprehensive Magic: The Gathering card editor built with React, TypeScript, and Material-UI.

## Features

- **Complete MTG Card Support**: Create any type of MTG card including creatures, spells, artifacts, enchantments, planeswalkers, and lands
- **Mana Cost Builder**: Visual mana cost builder with support for all mana types including hybrid and Phyrexian mana
- **Real-time Preview**: Live card preview with both visual card rendering and text-based preview modes
- **Comprehensive Validation**: Built-in validation for card rules and formatting
- **Template System**: Pre-built templates for common card types
- **Export Options**: Export cards as JSON, text, or images
- **Type Safety**: Full TypeScript support with comprehensive type definitions

## Quick Start

```tsx
import { MTGCardEditor } from '@/src/features/mtgCardEditor';

function MyApp() {
  return <MTGCardEditor />;
}
```

## Components

### Core Components

- `MTGCardEditor` - Main editor component with split-panel layout
- `MTGCardForm` - Form interface for editing card properties
- `MTGCardPreview` - Live preview of the card being edited
- `MTGCardFrame` - Visual card rendering component

### Form Components

- `BasicInfoForm` - Name, rarity, set, artist, flavor text
- `ManaCostForm` - Mana cost builder with symbol picker
- `CardTypeForm` - Supertype, types, and subtypes selection
- `StatsForm` - Power/toughness for creatures, loyalty for planeswalkers
- `TextForm` - Rules text with formatting guidance
- `ArtForm` - Image upload and URL input

### Utility Hooks

- `useMTGCard` - Access to card state and actions
- `useMTGCardExport` - Export functionality
- `useMTGCardTemplates` - Template management

## Card Types Supported

### Creatures

- Basic creatures with power/toughness
- Creatures with abilities
- Legendary creatures
- Artifact creatures

### Spells

- Instants
- Sorceries
- With full mana cost support

### Artifacts

- Equipment with equip costs
- Utility artifacts
- Artifact creatures

### Enchantments

- Auras with enchant targets
- Global enchantments
- Sagas (basic support)

### Planeswalkers

- Multi-ability planeswalkers
- Loyalty counters
- Ultimate abilities

### Lands

- Basic lands
- Utility lands with activated abilities

## Mana System

The editor supports all MTG mana types:

- Generic mana: `{1}`, `{2}`, `{3}`, etc.
- Colored mana: `{W}`, `{U}`, `{B}`, `{R}`, `{G}`
- Variable mana: `{X}`
- Colorless mana: `{C}`
- Hybrid mana: `{W/U}`, `{R/G}`, etc.
- Phyrexian mana: `{W/P}`, `{B/P}`, etc.

## Validation

The editor includes comprehensive validation:

- Required fields based on card type
- Mana cost format validation
- Power/toughness format validation
- Loyalty counter validation
- Type line validation

## Templates

Pre-built templates for quick card creation:

### Creatures

- Basic Creature (3/2 for 3 mana)
- Flying Creature (2/1 flyer)
- Legendary Creature (multicolor with abilities)

### Spells

- Simple Instant (card draw)
- Damage Sorcery (direct damage)

### Artifacts

- Equipment (+2/+1, equip 2)
- Utility Artifact (activated ability)

### Others

- Aura enchantment
- Planeswalker
- Basic and utility lands

## Usage Examples

### Basic Usage

```tsx
import { MTGCardProvider, MTGCardEditor } from '@/src/features/mtgCardEditor';

function App() {
  return (
    <MTGCardProvider>
      <MTGCardEditor />
    </MTGCardProvider>
  );
}
```

### Using the Context

```tsx
import { useMTGCard } from '@/src/features/mtgCardEditor';

function MyComponent() {
  const { state, updateCard, validateCard } = useMTGCard();

  const handleNameChange = (name: string) => {
    updateCard({ name });
  };

  return (
    <input
      value={state.card.name}
      onChange={e => handleNameChange(e.target.value)}
    />
  );
}
```

### Using Templates

```tsx
import { useMTGCardTemplates } from '@/src/features/mtgCardEditor/components/hooks/useMTGCardTemplates';

function TemplateSelector() {
  const { loadTemplate } = useMTGCardTemplates();
  const { setCard } = useMTGCard();

  const loadCreatureTemplate = () => {
    const template = loadTemplate('basicCreature');
    setCard(template);
  };

  return <button onClick={loadCreatureTemplate}>Load Basic Creature</button>;
}
```

## Accessing the Editor

The MTG Card Editor is available at `/mtg-editor` when running the development server.

## File Structure

```
src/features/mtgCardEditor/
├── components/
│   ├── editor/          # Main editor components
│   ├── forms/           # Form components
│   ├── preview/         # Preview components
│   ├── demo/            # Demo page component
│   └── hooks/           # Custom hooks
├── contexts/            # React contexts
├── types/               # TypeScript definitions
├── utils/               # Utility functions
├── styles/              # CSS styles
└── index.ts             # Main exports
```

## Contributing

When adding new features:

1. Follow the existing component structure
2. Add proper TypeScript types
3. Include validation logic
4. Update templates if needed
5. Add to the main exports

## Notes

- The editor follows MTG rules and conventions
- Card validation is comprehensive but not exhaustive
- Image export requires additional setup (html2canvas)
- Templates can be extended for custom card types
