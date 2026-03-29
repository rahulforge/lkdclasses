# Chatbot Avatar Setup

## What was added

- `src/components/ChatAvatar.tsx`
- upgraded `src/components/ChatWidget.tsx`

The avatar is built to feel human and alive without heavy libraries:

- idle floating motion
- subtle head sway
- blinking eyes
- listening mode when input is focused / request is in flight
- speaking mode when bot response renders
- active glow
- hover lift

## Image source

Default avatar path:

```env
NEXT_PUBLIC_CHATBOT_AVATAR=/images/founder.png
```

Put your founder image in:

```text
public/images/founder.png
```

## Best free way to convert real image into doodle style

### Option A — fastest, fully free
Use these tools:
- remove.bg alternative: `https://www.adobe.com/express/feature/image/remove-background` or `https://www.photoroom.com/tools/background-remover`
- doodle/vector cleanup: `https://www.photopea.com/`
- optional vector trace: `https://vectorizer.ai/` alternatives or Inkscape local trace bitmap

### Recommended workflow
1. Remove background from founder image
2. In Photopea:
   - increase contrast slightly
   - reduce saturation a bit
   - add a subtle stroke/outline around silhouette
   - export as transparent PNG
3. Save as:
   - `public/images/founder.png`
4. If you want a true vector look:
   - use Inkscape `Path > Trace Bitmap`
   - simplify
   - export transparent SVG or PNG

## Why this implementation is production-safe

Instead of running runtime image processing, the app applies a lightweight illustration treatment in the UI layer:

- gradient backplate
- sketch ring
- highlight wash
- expression overlays
- motion states

This keeps it:
- fast on mobile
- deterministic
- cheap
- maintainable

## Avatar modes

`ChatAvatar` supports:
- `idle`
- `listening`
- `speaking`

Usage:

```tsx
<ChatAvatar
  src="/images/founder.png"
  size={64}
  mode="speaking"
  active
/>
```

## Integration behavior

Current widget logic:
- user starts typing/focuses input -> `listening`
- request pending -> `listening`
- bot response arrives -> `speaking`
- then returns to `idle`

## If you want it even more doodle-like

Next upgrades I’d recommend:
- provide a transparent PNG cutout with cleaner edges
- create a simplified SVG portrait from the founder image
- add alternate mouth frames for speaking
- add 2-3 sticker-like accent shapes behind the avatar
- add message-by-message lip-sync timing
