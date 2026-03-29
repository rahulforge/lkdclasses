# Chatbot Setup

## What was added

- `src/app/api/chat/route.ts` - hybrid chat API
- `src/components/ChatWidget.tsx` - floating website chat widget
- `src/lib/chat/*` - intent detection, retrieval, AI guardrails, caching, rate limiting
- `supabase/chatbot.sql` - `documents` table, pgvector index, RPC, sample data
- `scripts/sync-chatbot-embeddings.mjs` - optional embedding sync script

## Architecture

1. Rule layer
   - Detects high-confidence intents using keywords
   - Handles fees, courses, admission, timings, results, contact, greeting
2. Retrieval layer
   - Reads institute data from Supabase `documents`
   - Uses pgvector similarity search when embeddings are available
   - Falls back to lexical retrieval when embeddings are missing
3. AI layer
   - Optional and guarded
   - Uses OpenRouter only if configured
   - Prompt is hard-restricted to the retrieved context
   - If context is insufficient, response must be `Please contact institute`

## Environment variables

Add these to your `.env`:

```env
NEXT_PUBLIC_SITE_URL=https://lkdclasses.com
NEXT_PUBLIC_SITE_NAME=LKD Classes
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

NEXT_PUBLIC_INSTITUTE_PHONE=+91 8002271522
NEXT_PUBLIC_INSTITUTE_EMAIL=lkdclasses2007@gmail.com
NEXT_PUBLIC_INSTITUTE_ADDRESS=Parsa Road, Sitalpur, Saran, Bihar, India
NEXT_PUBLIC_INSTITUTE_TIMINGS=Morning and evening batches are available. Please contact institute for the latest batch timings.
NEXT_PUBLIC_RESULTS_URL=/result
NEXT_PUBLIC_REGISTER_URL=/register
NEXT_PUBLIC_CONTACT_URL=/contact

# Optional AI / embeddings
OPENROUTER_API_KEY=
CHAT_COMPLETION_MODEL=openai/gpt-4o-mini
CHAT_EMBEDDING_MODEL=text-embedding-3-small
CHAT_EMBEDDING_PROVIDER=openrouter
```

If you want fully zero-AI mode:

```env
CHAT_EMBEDDING_PROVIDER=disabled
OPENROUTER_API_KEY=
```

The chatbot will still work with rule responses + lexical database retrieval.

## Supabase setup

Run `supabase/chatbot.sql` in the Supabase SQL editor.

That creates:

- `documents`
- pgvector index
- `match_documents(query_embedding, match_count)` RPC
- starter institute content

## Load real institute data

Replace the sample document content with your actual institute facts:

- exact fees
- exact courses
- exact admission steps
- exact timings
- exact contact details
- exact published results policy

Keep each document factual and compact. Do not dump marketing copy into the knowledge base.

## Generate embeddings

Optional, but recommended for better RAG quality.

```bash
npm run chatbot:sync-embeddings
```

This script:

- fetches rows from `documents`
- creates embeddings via OpenRouter
- writes vectors back into Supabase

## API contract

`POST /api/chat`

Request:

```json
{
  "message": "fees kitni hai"
}
```

Response:

```json
{
  "answer": "Current monthly fees...",
  "source": "rule",
  "intent": "fees",
  "suggestions": ["Class 10 fee", "Competition fee", "Admission process"]
}
```

## Notes

- Current rate limiting is in-memory per instance.
- Current response caching is in-memory with 5-minute TTL.
- For multi-instance scaling later, move both to Redis or a Supabase-backed limiter table.
- The widget is global and appears across the site via `src/app/layout.tsx`.

## Recommended content structure for `documents`

Use one document per fact group:

- `fees-monthly`
- `courses-available`
- `admission-process`
- `timings-batches`
- `contact-details`
- `results-policy`

Keep answers deterministic. If a fact changes, update the document first.
