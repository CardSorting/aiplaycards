# Unique Pokemon Name Generation

This system generates completely unique Pokemon names inspired by real Pokemon names using the Gemini API, replacing the direct use of original Pokemon names in card generation.

## Overview

Instead of using original Pokemon names directly from the PokeAPI, the system now:

1. **Fetches original Pokemon names** from the PokeAPI (as before)
2. **Uses Gemini API** to generate unique names inspired by the originals
3. **Caches generated names** to avoid regenerating the same inspirations
4. **Uses the unique names** for card generation, creating completely original Pokemon

## Architecture

### Core Components

#### 1. Name Generation Service (`src/features/generation/name-service.ts`)

- **PokemonNameGeneratorService**: Main class for generating unique names
- **Caching**: Persistent disk cache to avoid regenerating the same names
- **Fallback**: Simple fallback generation if AI fails
- **Batch Processing**: Efficient batch processing for multiple names

#### 2. Pokemon Pool Utilities (`src/utils/pokemon-pool.ts`)

- **getUniquePokemonPool()**: Get a pool of unique names for bulk generation
- **getRandomUniquePokemonName()**: Get a single random unique name
- **getOriginalPokemonPool()**: Access to original Pokemon names (unchanged)

#### 3. Updated Processing Files

- **processing.ts** and **processing-safe.ts**: Now use unique name generation
- **API Integration**: Seamless integration with existing card generation

### API Endpoints

#### Test Endpoint: `/api/generate-unique-names`

**GET**: Generate unique names based on original Pokemon names

```bash
# Generate 10 random unique names
GET /api/generate-unique-names?count=10

# Generate a name inspired by specific Pokemon
GET /api/generate-unique-names?inspiration=Pikachu
```

**POST**: Generate unique names from custom inspirations

```json
{
  "inspirations": ["Pikachu", "Charmander", "Bulbasaur"]
}
```

## Implementation Details

### Name Generation Process

1. **Inspiration Selection**: Original Pokemon name is selected from PokeAPI cache
2. **AI Prompt**: Gemini is prompted to create a unique name inspired by the original
3. **Validation**: Generated name is validated for Pokemon-like characteristics
4. **Caching**: Valid names are cached to disk for future use
5. **Fallback**: If AI fails, a simple fallback name is generated

### Prompt Engineering

The Gemini prompt is designed to:

- Create Pokemon-like names (4-12 characters)
- Ensure uniqueness from the inspiration
- Maintain pronounceability and memorability
- Follow Pokemon naming conventions

### Caching Strategy

- **File Location**: `.cache/pokemon-names-cache.json`
- **Structure**: Array of `{ originalName, generatedName, createdAt }`
- **In-Memory**: Fast lookup with Map structure
- **Persistence**: Automatic saving to disk after each generation

### Error Handling

1. **AI Failures**: Automatic retry with exponential backoff
2. **Network Issues**: Graceful fallback to simple name variants
3. **Cache Issues**: Continue operation even if cache is corrupted
4. **Validation Failures**: Retry generation or use fallback

## Configuration

### Environment Variables

The system uses the existing `GEMINI_API_KEY` environment variable.

Optional environment variables:

- `POKEDEX_UPSTREAM_URL`: PokeAPI endpoint (unchanged)
- `POKEDEX_CACHE_PATH`: Cache path for original names (unchanged)

### Cache Management

```typescript
import { getPokemonNameGenerator } from 'src/features/generation/name-service';

const generator = await getPokemonNameGenerator();

// Get cache statistics
const stats = generator.getCacheStats();
console.log(`Cached names: ${stats.totalEntries}`);

// Clear cache if needed
await generator.clearCache();
```

## Usage Examples

### Basic Usage (Automatic Integration)

The system automatically integrates with existing booster pack generation:

```typescript
// This now automatically uses unique names
const card = await generateCardSafe(jobId, userId, baseUrl);
```

### Manual Name Generation

```typescript
import { generateUniquePokemonName } from 'src/features/generation/name-service';

// Generate a single unique name
const uniqueName = await generateUniquePokemonName('Pikachu');
console.log(uniqueName); // e.g., "Volteon"

// Generate multiple names
const uniqueNames = await generateUniquePokemonNames(['Pikachu', 'Charmander']);
console.log(uniqueNames); // e.g., ["Volteon", "Flamara"]
```

### Pool-based Generation

```typescript
import { getRandomUniquePokemonName } from 'src/utils/pokemon-pool';

// Get a random unique name (used in booster generation)
const randomName = await getRandomUniquePokemonName(baseUrl);
```

## Testing

### Manual Testing

1. **Test single name generation**:

```bash
curl "http://localhost:3000/api/generate-unique-names?inspiration=Pikachu"
```

2. **Test batch generation**:

```bash
curl "http://localhost:3000/api/generate-unique-names?count=5"
```

3. **Test POST endpoint**:

```bash
curl -X POST "http://localhost:3000/api/generate-unique-names" \
  -H "Content-Type: application/json" \
  -d '{"inspirations": ["Pikachu", "Charmander"]}'
```

### Integration Testing

The new system integrates seamlessly with existing booster pack generation. Test by:

1. Opening booster packs in the application
2. Verifying that generated cards have unique names
3. Checking that names are cached (subsequent generations should be faster)

## Performance Considerations

### Caching Benefits

- **First Generation**: ~2-3 seconds per name (AI generation)
- **Cached Names**: Instant retrieval
- **Batch Processing**: 5 names processed simultaneously

### Fallback Performance

- **AI Failures**: Simple fallback generation in <100ms
- **Network Issues**: Graceful degradation with cached names

### Memory Usage

- **In-Memory Cache**: Minimal impact (~1KB per 100 cached names)
- **Disk Cache**: JSON file, typically <100KB for 1000+ names

## Migration Notes

### Backward Compatibility

- **Existing Cards**: No changes to existing cards or data
- **API Compatibility**: All existing endpoints continue to work
- **Gradual Rollout**: Can be enabled/disabled via feature flags if needed

### Database Impact

- **No Schema Changes**: No database migrations required
- **New Cards**: Only new cards will use unique names
- **Performance**: Minimal impact on database operations

## Troubleshooting

### Common Issues

1. **"Gemini API key not configured"**

   - Ensure `GEMINI_API_KEY` is set in environment variables
   - Restart the application after adding the key

2. **Slow name generation**

   - First-time generation is slower (AI processing)
   - Subsequent uses of the same inspiration are instant (cached)

3. **Invalid generated names**

   - System automatically retries with different parameters
   - Falls back to simple name variants if AI consistently fails

4. **Cache corruption**
   - Delete `.cache/pokemon-names-cache.json` to reset
   - System will regenerate cache automatically

### Monitoring

Check cache statistics and performance:

```typescript
const generator = await getPokemonNameGenerator();
const stats = generator.getCacheStats();
console.log('Cache stats:', stats);
```

## Future Enhancements

1. **Advanced Prompting**: More sophisticated prompts for different Pokemon types
2. **Regional Variants**: Generate names with regional themes
3. **Evolution Chains**: Generate related names for card series
4. **User Preferences**: Allow users to influence name generation style
5. **Analytics**: Track which generated names are most popular
