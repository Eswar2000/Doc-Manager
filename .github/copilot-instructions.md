# Copilot / AI Agent Instructions — Template Studio (doc-manager)

> Read this file **before** answering any question or making any change in this repo. It captures the project's domain model, architecture, conventions and "do / don't" rules so that suggestions stay consistent with the rest of the codebase.

---

## 1. What this project is

**Template Studio** (folder name `doc-manager`) is a multi-tenant, web-based contract-templating application (think "Docusign for template authoring + generation").

Users can:

1. Define **Attributes** — typed, reusable placeholders (`text` / `number` / `date` / `email`).
2. Author **Templates** in a rich-text editor — content can embed attributes as placeholders and wrap blocks in **Conditional Rules** that show/hide content based on attribute values.
3. **Generate** final documents (currently PDF) by filling in an attribute form for a chosen template.
4. Work inside isolated **Workspaces (tenants)** with per-workspace members and roles.

Snippets (reusable content blocks) and AI-assisted template generation are planned but **not implemented**. Treat any UI labeled "coming soon" as not-yet-built.

---

## 2. Tech stack

### Frontend (`frontend/`)
- **React 19** + **TypeScript** + **Vite 7**
- **Tailwind CSS v4** (via `@tailwindcss/vite`) with `tw-animate-css`
- **shadcn/ui** components (Radix primitives) — already vendored in `frontend/src/components/ui/`
- **TanStack Query v5** for server state
- **TanStack Table v8** for tables
- **Zustand v5** for client-only state
- **React Router v7** (data router not used; classic `BrowserRouter` + `Routes`)
- **Tiptap v3** as the rich-text editor (ProseMirror under the hood)
- **MSAL Browser/React v5** for authentication
- **Axios** for HTTP
- **Sonner** for toasts
- **lucide-react** for icons
- **date-fns** for date formatting
- **uuid** for client-side IDs

### Backend (`backend/`)
- **Python 3.10+**, **FastAPI**
- **Uvicorn** ASGI server
- **fastapi-azure-auth** for Microsoft Entra ID (Azure AD) token validation
- **Azure Cosmos DB** (async SDK) via `azure-cosmos` + `azure-identity` (`DefaultAzureCredential`, RBAC — no DB keys in code)
- **Playwright (chromium, async)** for HTML→PDF rendering
- **BeautifulSoup** for HTML manipulation
- **Pydantic v2** models

---

## 3. Repository layout

```
README.md                       # High-level product overview
docs/auth-setup.md              # MSAL / Entra ID setup notes
backend/
  README.md                     # Backend run instructions
  requirements.txt
  src/
    main.py                     # FastAPI app, CORS, router wiring, swagger OAuth
    config/
      auth_config.py            # Azure scheme (fastapi-azure-auth)
      settings.py               # Pydantic settings
    db/client.py                # Cosmos async client (lazy, RBAC via DefaultAzureCredential)
    model/                      # Pydantic schemas
      attributes.py             # Attribute, AttributeType, Create/Update requests
      templates.py              # Template, TemplateAttribute, TemplateRule(s), DocumentGenerationRequest, Rollback
      tenants.py                # Tenant, TenantMember, TenantRole, branding/settings
      common.py                 # Shared User model, etc.
    repository/                 # Cosmos data access (one per aggregate)
    service/                    # Business logic (one per aggregate; thin pass-through where possible)
    router/                     # FastAPI routers (auth-protected via Depends(azure_scheme))
    utils/
      auth_utils.py             # get_current_user → {email, name}
      tenant_utils.py           # get_current_tenant_id (reads X-Tenant-ID header, validates tenant)
      template_utils.py         # validate_attribute_values, render_html_from_template, apply_rules_to_html
      pdf_utils.py              # html_to_pdf_bytes (playwright)
frontend/
  package.json
  vite.config.ts
  tsconfig*.json
  index.html
  redirect.html                 # MSAL redirect target
  public/
  src/
    main.tsx                    # Root: <AuthProvider> > <QueryClientProvider> > <App/>
    App.tsx                     # BrowserRouter + routes + Toaster
    App.css / index.css
    api/                        # One file per backend aggregate
      index.tsx                 # axios instance, MSAL token interceptor, X-Tenant-Id injection
      attributes.tsx
      templates.tsx
      tenants.tsx
    auth/
      msal-config.ts            # MSAL config + loginRequest scopes
      msal-instance.ts          # PublicClientApplication singleton
      auth-provider.tsx         # Initializes MSAL, handles redirect, sets active account
      use-current-user.ts       # Hook returning { name, email, initials, userId }
    components/
      main-layout.tsx           # Authenticated shell: <Sidebar/> + <Outlet/>
      sidebar/                  # sidebar + sidebar-item + sidebar-user-profile (tenant switcher)
      data-table/               # Reusable table built on TanStack Table (toolbar, filters, pagination)
      dynamic-dialog/           # Generic schema-driven create/edit dialog
      editor/                   # Tiptap editor + custom nodes (attribute-field, conditional-block) + table bubble menu + resizable-image
      loader/                   # Full-area Loader (uses shadcn Empty + Spinner)
      overlay-loader/           # Full-screen busy overlay
      error-state/              # Empty-with-AlertCircle error panel + retry/home buttons
      multiselect/              # MultiSelect input
      ui/                       # shadcn primitives (DO NOT modify casually — these are vendored)
    hooks/use-my-tenants.ts     # Loads tenants on mount, restores currentTenantId from localStorage
    lib/{date.ts,label.ts,utils.ts}  # formatDateTime, formatLabel, cn()
    pages/
      login-page.tsx
      attributes-page.tsx
      templates-page.tsx
      editor-page.tsx           # Template/Snippet builder (Tiptap + right builder panel)
      doc-generation-page.tsx   # Fill-and-download form for a template
      workspace-page.tsx        # Tenant settings + members
    stores/tenant-store.ts      # Zustand: tenants[], currentTenantId (persisted to localStorage)
    types/index.tsx             # ALL shared TS types live here
```

> When adding a new aggregate, follow this 5-layer pattern on the backend: `model/` → `repository/` → `service/` → `router/` → wire in `main.py`. On the frontend: `api/<name>.tsx` → page + types.

---

## 4. Domain model — invariants you must respect

### Attributes
- `type` is one of `text | number | date | email` (see `AttributeType` enum, mirrored on both sides).
- `type` is **immutable after creation** (the edit form disables it).
- `name`, `description` lengths are enforced both client-side (`maxLength`) and server-side (Pydantic `min_length`/`max_length`). Keep them in sync if you change one side.
- Attributes are tenant-scoped. The `tenantId` is set server-side from `X-Tenant-Id`; **never** accept it from the client body.

### Templates
- Stored as a **single Cosmos document per version**. Versioning is implemented as separate documents, all linked by `parentTemplateId`:
  - `version: 1` is the **root**; its `parentTemplateId` is `null`. Its `id` is the lineage's "root v1 id".
  - `version: 2..N` documents have `parentTemplateId = <root v1 id>`.
- **Exactly one document per lineage is `state: "active"`** at a time. All previous versions are `state: "archived"`.
- **Update flow** (`PUT /templates/{id}`):
  1. Load the existing template (must be `active`, else 400).
  2. **Archive** it (set `state: "archived"`, stamp `modifiedAt`/`modifiedBy`).
  3. **Create** a new document with a new `uuid` id, `version = old.version + 1`, `state: "active"`, `parentTemplateId = root v1 id`.
  - Do **not** mutate in place. Never overwrite an active version's content.
- **Delete flow** (`DELETE /templates/{id}`): if other versions exist, roll back to the previous version (archive current, re-activate the previous). If only one version exists, hard-delete.
- **Rollback flow** (`POST /templates/rollback`): archive current active, activate `destTemplateId` (or previous version if `destTemplateId` is omitted).
- Templates store **two content representations**:
  - `htmlContent` (string) — used by the PDF renderer.
  - `jsonContent` (any, ProseMirror JSON) — used to rehydrate Tiptap on edit.
  - **Both must be kept in sync.** When saving from the editor, emit both from the same `editor` instance: `editor.getHTML()` and `editor.getJSON()`.
- `attributes: TemplateAttribute[]` is the compiled "form schema" for document generation. Each entry has:
  - `attributeId` (== `fieldKey` of the Tiptap node, equals the `Attribute.id` it references)
  - `label`, `type`, `required`, `hidden`, `defaultValue`
  - `trackerIds: string[]` — every concrete occurrence of that attribute in the document carries its own `trackerId` (uuid) so renderers can target specific placements.
- `rules: TemplateRule[]` describes each conditional block:
  - `condition: { join: 'and' | 'or', items: [{ fieldKey, operator, value }] }`
  - `action: 'show' | 'hide'`
  - `content`: ProseMirror JSON of the block's children (used by the backend renderer to evaluate and substitute).

### Tenants (workspaces)
- A user's tenants are returned by `GET /tenants/my-tenants` (called via `useMyTenants`).
- `currentTenantId` lives in Zustand (`useTenantStore`) and is persisted to `localStorage` under the key `currentTenantId`.
- Every authenticated request **except** routes starting with `/tenants` carries an `X-Tenant-Id` header (see `EXCLUDED_TENANT_ROUTES` in `frontend/src/api/index.tsx`).
- Backend `get_current_tenant_id` dependency validates the header: present → tenant exists → tenant `isActive`. Permission-vs-role enforcement is a TODO and must be respected when adding new endpoints.
- Roles: `admin | can_create | can_edit | can_delete | can_view | can_use`. UI gating by role is **not yet implemented end-to-end** — do not assume it is.

---

## 5. Authentication rules

- Identity is **Microsoft Entra ID** via MSAL (frontend) and `fastapi-azure-auth` (backend). The scope is `api://<azure_client_id>/access_as_user`.
- Every backend router is mounted with `dependencies=[Depends(azure_scheme)]` in `backend/src/main.py`. The only unauthenticated endpoint is `GET /health`.
- The frontend axios instance (`frontend/src/api/index.tsx`) attaches `Authorization: Bearer <accessToken>` via `msalInstance.acquireTokenSilent` on every request, and also injects `X-Tenant-Id`.
- **Do not** call backend endpoints with `fetch` directly or bypass the shared axios instance — you'll lose auth + tenant headers.
- **Do not** mutate `msal-config.ts` scopes ad-hoc; the backend validates exactly the configured scope.
- **Do not** store tokens manually. MSAL caches them.

---

## 6. Frontend conventions

### State management
- **Server state** → TanStack Query. Query keys are tuples that **always include `currentTenantId`** for tenant-scoped resources: `['attributes', currentTenantId]`, `['templates', currentTenantId]`, `['tenant', currentTenantId]`. Cross-tenant queries like `['my-tenants']` omit it.
- **Client state** → Zustand (`stores/`). Only put client-only state there (selected tenant, UI flags). **Never** mirror server data into Zustand.
- Standard query options used across pages:
  ```ts
  staleTime: 1000 * 60,
  gcTime:    1000 * 60 * 5,
  enabled:   !!currentTenantId,
  retry: false, refetchOnWindowFocus: false, refetchOnReconnect: false, refetchOnMount: true,
  ```
  Stick to this unless there's a reason. Always gate tenant-scoped queries on `!!currentTenantId`.

### Mutations
- Mutations use `try / await api… / queryClient.invalidateQueries({ queryKey: [...] }) / toast.success` then `catch` → `toast.error` with `description = err instanceof Error ? err.message : "..."`.
- Toast durations: `2000` for success (no close button), `3000` for errors (no close button) — match the existing pattern.
- Toaster is mounted **once** in `App.tsx` (`richColors`, `position="bottom-left"`, `closeButton`, `duration={3000}`). Do not add a second `<Toaster/>`.

### Reusable building blocks (use these, don't re-invent)
- **`DataTable`** (`components/data-table/data-table.tsx`) for lists. Pass `columns`, `data`, `filterColumnKey`, `facetedFilters`, `showCreateButton`, `onCreate`. Build columns via `getColumns<T>([...])` and headers via `DataTableColumnHeader`. Row actions via `DataTableRowActions` + `TableAction<T>[]`.
- **`DynamicDialog`** (`components/dynamic-dialog`) for all create/edit forms. Pass `fields: DynamicField[]`. Supported field `type`s: `text | textarea | number | select | multiselect | conditions`. Validation is built in (required, maxLength, number, conditions).
- **`Loader`** (`components/loader`) — full-area loading state with header + message. **`OverlayLoader`** for blocking action overlays.
- **`ErrorState`** (`components/error-state`) — error panel with optional `onRetry` / `onHome`.
- **`MultiSelect`** (`components/multiselect`) — used for role pickers, etc.

> If you find yourself writing a one-off `<table>`, `<Dialog>` form, or custom spinner, stop and use the components above.

### shadcn/ui primitives
- Located in `frontend/src/components/ui/`. They are vendored — treat them as part of the codebase, not as an external library.
- Available: `accordion, alert, avatar, badge, button, calendar, card, checkbox, command, dialog, dropdown-menu, empty, input, label, popover, select, separator, sonner, spinner, table, textarea, tooltip`.
- Compose with `cn()` from `lib/utils.ts`. Do not add a new className utility.

### Styling
- Tailwind v4. Primary brand color is **indigo** (`indigo-500/600/700`); destructive is shadcn's `destructive`. State colors used:
  - Active template / "show" action / success → `emerald-*`
  - Archived template / "hide" action → `rose-*` / `amber-*`
  - Info badges → `indigo-50/100`
- Active input/CTA styling pattern in the codebase: `border-indigo-500 bg-indigo-50/50 shadow-sm focus-visible:ring-1 focus-visible:ring-indigo-500`. Reuse it for new inputs.
- Default font is `Inter`. The editor exposes Inter / Arial / Georgia / Times New Roman / Courier New.

### Routing
- All authenticated routes are children of a single `<Route element={<MainLayout/>}>` block in `App.tsx`.
- `/login` is the only public route. Unknown routes redirect to `/` (authenticated) or `/login`.
- When adding a page: create `pages/<name>-page.tsx`, default-export the component, register the route in `App.tsx`, add a `SidebarItem` in `main-layout.tsx` if user-facing.

### Editor (Tiptap)
- The editor is rendered in `components/editor/editor.tsx`. It exposes the underlying editor via `onEditorReady(editor)`; pages own all save/load logic.
- **Custom nodes** (must not be removed or renamed without coordinated changes on the backend):
  - `attributeField` — inline atom node with attrs `{ label, trackerId, fieldKey, required, hidden, defaultValue }`. `fieldKey === Attribute.id`. Render HTML uses `{{ Label }}` syntax (with truncated default in parentheses for display).
  - `conditionalBlock` — block-level node with attrs `{ id, condition, action, name }`. Edits dispatch a `window` `CustomEvent('edit-conditional-block', { detail })` consumed by `editor-page.tsx`.
- When saving from the editor:
  1. Traverse `editor.state.doc` once to collect `attributeField` nodes → group by `fieldKey` into `TemplateAttribute[]` (carry every `trackerId`).
  2. Traverse again to collect `conditionalBlock` nodes → `TemplateRule[]` with their inner JSON content.
  3. Send both `editor.getHTML()` (`htmlContent`) and `editor.getJSON()` (`jsonContent`).

### Forms & validation
- Prefer **client + server** validation. Client-side validation lives in `DynamicDialog.validateForm` (or page-level for bespoke flows like `doc-generation-page.tsx`).
- Date placeholder values are passed to backend as `dd-MM-yyyy` strings (see `_eval_attribute_type` in `backend/src/utils/template_utils.py`). Stick to that format end-to-end.
- File-name regex for generated PDF downloads: `^[a-zA-Z0-9 _-]+$`, max 50 chars.

### Naming
- Files: **kebab-case** (e.g., `data-table-row-actions.tsx`, `use-my-tenants.ts`).
- React components: **PascalCase** functions, default-exported for pages, named-exported for shared components.
- TS types: **PascalCase**, all under `frontend/src/types/index.tsx`. Do not create per-feature type files; extend the central one.
- Hooks: `use-*` prefix.
- Zustand stores: `<name>-store.ts`, exporting `useXStore`.

---

## 7. Backend conventions

### Layering (strict)
```
router  →  service  →  repository  →  Cosmos
```
- Routers handle HTTP, validation, status codes, logging. **Do not** call the repository directly from a router.
- Services hold business logic; many are thin pass-throughs today — that's fine, keep the layer.
- Repositories own all Cosmos queries and document shape.
- Models (`backend/src/model/`) are the single source of truth for request/response schemas.

### FastAPI patterns
- Each router defines a module-level `router = APIRouter(prefix=..., tags=[...])` and exports it as `router`.
- Wire new routers in `main.py` with `app.include_router(<router>, dependencies=[Depends(azure_scheme)])`.
- Tenant-scoped endpoints take `tenant_id: str = Depends(get_current_tenant_id)`.
- User-attributed endpoints take `current_user: dict = Depends(get_current_user)` — this is a `{email, name}` dict, not a fastapi-azure-auth `User`.
- Use the existing logging style (`print(f"<Operation>: ...")`) for now. If you introduce a logger, replace consistently across the file, not piecemeal.
- Status codes: 201 for create, 200 for read/update, 204 for delete/rollback (`Response(status_code=204)`), 400 for validation, 404 for not found, 409 for concurrency conflict, 500 for unexpected.
- Wrap repository/service calls in `try/except HTTPException as e: raise e` then a generic `except Exception` → 500 with `{message, error}` detail (matches existing handlers).

### Cosmos DB
- All access goes through `src/db/client.py` (`get_container("<name>")`). Containers in use: `templates`, `attributes`, `tenants` (verify names in the repository class you're touching before assuming).
- Partition strategy: **tenant-scoped containers use `tenantId` as the partition key**. Always pass `partition_key=tenant_id` to `read_item` / `delete_item`. For cross-partition `query_items` use `partition_key=None` and add `c.tenantId = @tenantId` to the WHERE clause.
- Authentication is **RBAC via `DefaultAzureCredential`**. Never introduce connection-string or master-key auth.
- Always set `createdAt` / `modifiedAt` as ISO-8601 UTC: `datetime.now(timezone.utc).isoformat()`.
- Always set `createdBy` / `modifiedBy` from `current_user`.
- Handle `azure.cosmos.exceptions.CosmosHttpResponseError`. Treat `status_code == 404` as "not found" (return `None` from repository), `409` as a concurrency conflict (raise `HTTPException(409)`).

### Pydantic
- Pydantic **v2** (`pydantic-settings>=2`). Use `Field(..., description=...)`, `Config { populate_by_name = True, from_attributes = True }` to match existing models.
- Request models use the suffix `…CreateRequest`, `…UpdateRequest`, `…RollbackRequest`, etc. Response models inherit from the base entity and only override `Config`.

### PDF generation
- `pdf_utils.html_to_pdf_bytes` uses **async Playwright (chromium)**. The route returns `Response(content=pdf_bytes, media_type="application/pdf", headers={...})`.
- Because we use async Playwright, **uvicorn must not be run with `--reload`** — it forces a SelectorEventLoop that breaks PDF generation. Mention this in any docs change. (See `backend/README.md`.)

### Template rendering pipeline (server)
1. Fetch template by `(id, tenant_id)`.
2. `validate_attribute_values(values, template.attributes)` → `(resolved, missing)`. If `missing` is non-empty, return 400 with the missing list.
3. `apply_rules_to_html(template.htmlContent, template.rules, resolved)` → HTML with conditional blocks evaluated.
4. `render_html_from_template(html, resolved)` → final HTML with `{{ Label }}` placeholders replaced. **Values are HTML-escaped** to prevent injection — keep it that way.
5. `html_to_pdf_bytes(html, title=...)` → PDF bytes.

---

## 8. Cross-cutting "do / don't"

**Do**
- Use the central axios instance (`frontend/src/api/index.tsx`) for every backend call.
- Keep types in `frontend/src/types/index.tsx` and Pydantic models in `backend/src/model/`. Keep field names in sync (the backend uses camelCase fields like `createdAt`, `tenantId`, `attributeId` — match that on the frontend).
- Use `formatDateTime` from `frontend/src/lib/date.ts` for any date displayed in tables/cards.
- Use `formatLabel` from `lib/label.ts` for human-readable column/field labels.
- Use `Loader` / `ErrorState` for loading/error UI; never inline `<div>Loading…</div>`.
- Always invalidate the matching `queryClient.invalidateQueries({ queryKey: [...] })` after a mutation.
- When adding a new tenant-scoped resource, mount the router with `Depends(azure_scheme)`, take `tenant_id = Depends(get_current_tenant_id)`, partition Cosmos by `tenantId`, and include `tenantId` in every frontend query key.

**Don't**
- Don't introduce another HTTP client, state-management library, table library, or form library — use what's listed in §2.
- Don't store server data in Zustand. Don't fetch in `useEffect` — use React Query.
- Don't bypass the layering (`router → service → repository`). Don't put Cosmos calls in a router or service.
- Don't trust client-supplied `tenantId` / `createdBy` / `createdAt` / `id` / `version` / `state` in request bodies — the server sets these.
- Don't mutate `state: "active"` templates in place. Always archive + create a new version.
- Don't remove or rename the Tiptap custom nodes `attributeField` / `conditionalBlock` or their attribute keys (`fieldKey`, `trackerId`, `condition`, `action`, `name`) — existing template JSON depends on them.
- Don't run uvicorn with `--reload` (see §7).
- Don't add network calls to `/health` — it must remain auth-free and side-effect-free.
- Don't modify files under `frontend/src/components/ui/` for stylistic reasons. Treat them as the design-system baseline and compose with classes around them.
- Don't introduce environment variables to fix configuration ad-hoc; surface the requirement and ask first.

---

## 9. Build / run pointers

- **Frontend dev server**: `cd frontend && npm install && npm run dev` → `http://localhost:5173`
- **Frontend build**: `npm run build` (runs `tsc -b` then `vite build`)
- **Frontend lint**: `npm run lint`
- **Backend dev server**: `cd backend && python -m venv .venv && .venv\Scripts\activate && pip install -r requirements.txt && python -m playwright install chromium && uvicorn src.main:app --port 8000` (no `--reload`) → `http://localhost:8000`
- **API docs**: `/swagger` (with OAuth2 PKCE) and `/redoc`
- See `backend/README.md` and `frontend/README.md` for full setup. See `docs/auth-setup.md` for Entra ID configuration.

---

## 10. When you (the agent) are unsure

1. Re-read the relevant section above.
2. Inspect a sibling implementation (e.g., before adding an "import-templates" endpoint, study `template_router.py` + `template_service.py` + `template_repository.py` and copy the shape).
3. If a change crosses backend ↔ frontend boundaries (e.g., a new field on `Template`), update **both sides + `frontend/src/types/index.tsx` + Pydantic model** in the same change.
4. If a request seems to conflict with these rules, surface the conflict to the user rather than silently picking a side.

