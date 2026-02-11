

## Add apikey header to generator fetch calls

Since the generator edge functions are hosted on the external Supabase project (`vshitqqftdekgtjanyaa`), all fetch calls need the project's anon key in the `apikey` header. This is a publishable key, so it's safe to store in the codebase.

### Changes

**1. `src/config/generator.ts`** -- Add the anon key constant

```typescript
export const GENERATOR_ANON_KEY = "sb_publishable_dJhtpuPnb_sz3yYC1XdThQ_I-NzwuMS";
```

**2. `src/pages/Generator.tsx`** -- Add `apikey` header to both fetch calls

- **Guest fetch (line ~208-210):** Add `apikey: GENERATOR_ANON_KEY` to headers
- **Auth fetch (line ~293-294):** Add `apikey: GENERATOR_ANON_KEY` to `fetchHeaders`

Both calls will include:
```typescript
headers: {
  "Content-Type": "application/json",
  "apikey": GENERATOR_ANON_KEY,
  // ...existing auth headers if applicable
}
```

### Technical details

- Two lines changed in `src/config/generator.ts` (add export)
- Two header objects updated in `src/pages/Generator.tsx` (guest + auth paths)
- Import of `GENERATOR_ANON_KEY` added alongside existing `GENERATOR_FUNCTIONS_BASE_URL` import

