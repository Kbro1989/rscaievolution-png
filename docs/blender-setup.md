# Blender Configuration for Hybrid Generator

## Blender Installation

**Detected Path:**
```
C:\Program Files\Blender Foundation\Blender 5.0\blender-launcher.exe
```

## Configuration

### Option 1: Environment Variable (Recommended)
Create `.env` file in project root:
```env
BLENDER_PATH="C:\Program Files\Blender Foundation\Blender 5.0\blender-launcher.exe"
```

### Option 2: Default (Already Set)
The hybrid generator now defaults to your Blender 5.0 installation.

## Verification

Test Blender is accessible:
```bash
# Windows PowerShell
& "C:\Program Files\Blender Foundation\Blender 5.0\blender-launcher.exe" --version
```

Expected output:
```
Blender 5.0.x
```

## Usage

The hybrid generator will now automatically use Blender 5.0:

```typescript
import { hybridGenerator } from './services/backend/hybridContentGenerator';

// Blender will be called automatically
const result = await hybridGenerator.generateFromEntity({
  entityType: 'npc',
  entityId: 0,
  era: 12,
  outputName: 'test'
});
```

## Blender Commands Used

### Composite Entity
```bash
blender-launcher.exe --background --python composite_entity.py \
  -- --models model1.gltf,model2.gltf \
  --color-replacements [[...]] \
  --output output.glb
```

### Evolution Transform
```bash
blender-launcher.exe --background --python evolution_transformer.py \
  -- --input base.glb \
  --era 12 \
  --output evolved.glb
```

## Troubleshooting

### "Blender not found"
**Fix**: Path might have spaces. Try quoting:
```typescript
this.blenderPath = '"C:\\Program Files\\Blender Foundation\\Blender 5.0\\blender-launcher.exe"';
```

### "Python script error"
**Fix**: Ensure Blender 5.0 has Python bundled (it should by default)

### "Background mode not working"
**Fix**: Use `blender.exe` instead of `blender-launcher.exe`:
```
C:\Program Files\Blender Foundation\Blender 5.0\blender.exe
```

---

✅ **Blender 5.0 configured and ready!**
