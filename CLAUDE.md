# CLAUDE.md

## Project: Unix-like Personal Knowledge Site

This project is a personal blog and small forum built around an intentionally minimal, Unix-inspired engineering culture.

The project values:

- Content over decoration
- Function over appearance
- Simplicity over feature count
- Readability over cleverness
- Explicit behavior over magic
- Server-side rendering over unnecessary client-side code
- Native Web platform features over unnecessary abstractions
- Long-term maintainability over short-term convenience
- Engineering culture over startup-style product design

The site should feel like a tool built by an engineer for engineers, not a commercial SaaS product.

---

# 1. Core Philosophy

## 1.1 Content is the product

The primary purpose of this project is to publish and discuss technical knowledge.

The UI exists to make content:

- readable
- searchable
- navigable
- writable
- discussable

Do not introduce visual elements unless they improve one of those properties.

A page with excellent typography and useful information is better than a page with impressive animations and little content.

---

## 1.2 Unix philosophy

Prefer small, composable, understandable pieces.

Follow these principles:

- Do one thing well.
- Prefer composition over giant abstractions.
- Prefer plain data structures.
- Prefer text.
- Prefer predictable behavior.
- Prefer conventions that are easy to discover.
- Avoid unnecessary state.
- Avoid unnecessary dependencies.
- Avoid abstractions that exist only to hide simple code.

When two solutions are functionally equivalent, prefer the one with:

1. fewer dependencies
2. fewer moving parts
3. less code
4. fewer runtime assumptions
5. easier debugging
6. easier removal

---

# 2. Technology Stack

The project uses:

- Next.js
- App Router
- React
- TypeScript
- Tailwind CSS
- Prisma
- PostgreSQL
- Supabase
- Vercel
- pnpm

Use TypeScript throughout the entire application.

Do not introduce Java, Go, Python, Ruby, PHP, or another backend language for application functionality unless explicitly requested.

The application should remain a single Next.js application unless there is a strong architectural reason to split it.

---

# 3. Architecture

The default architecture is:

```text
Browser
   |
   v
Next.js
   |
   +-- Server Components
   |
   +-- Server Actions / Route Handlers
   |
   v
Prisma
   |
   v
PostgreSQL
   |
   v
Supabase
```

Vercel provides deployment and runtime infrastructure.

Do not introduce a separate backend service merely because the application has backend functionality.

Next.js is the BFF.

---

# 4. Server First

Prefer Server Components by default.

Use Client Components only when the browser genuinely needs client-side behavior.

Examples that may justify Client Components:

- interactive forms
- local UI state
- browser APIs
- optimistic updates
- interactive controls
- client-side event handling

Do not add `"use client"` automatically.

Before creating a Client Component, ask:

> Does this actually need to execute in the browser?

If the answer is no, keep it on the server.

---

# 5. Data Access

Database access should normally follow:

```text
UI
 ↓
Server Component / Server Action / Route Handler
 ↓
Application logic
 ↓
Prisma
 ↓
PostgreSQL
```

Do not access the database directly from browser code.

Never expose:

- database credentials
- Supabase service-role credentials
- private environment variables
- Prisma database URLs

to the browser.

---

# 6. Prisma

Prisma is the application's primary database access layer.

Do not bypass Prisma with raw SQL unless there is a demonstrated technical reason.

When Prisma is used:

- keep schema understandable
- use explicit relationships
- use meaningful model names
- avoid premature normalization
- avoid premature denormalization
- add indexes only for actual query patterns
- keep migrations committed

The Prisma schema should describe the application's domain clearly.

---

# 7. Database Design

The database should start small.

Do not design a hypothetical database for millions of users.

Design for the current project.

Possible initial domain:

```text
User
Post
Comment
Category
Tag
```

Additional entities should be introduced only when the feature actually requires them.

Avoid:

```text
GenericEntity
BaseEntity
ContentEntity
UniversalMetadata
DynamicProperty
```

unless there is a concrete reason.

Prefer boring schemas.

---

# 8. Content Model

The blog is primarily a publishing system.

A post should have:

- stable identifier
- title
- slug
- content
- publication state
- creation time
- update time

Potential states:

```text
draft
published
archived
```

Do not introduce a complicated CMS abstraction.

The content model should remain understandable from the Prisma schema alone.

---

# 9. Forum Model

The forum is an extension of the same application, not a separate product.

The basic conceptual model is:

```text
User
 |
 +-- Topic
       |
       +-- Reply
       |
       +-- Reply
       |
       +-- Reply
```

Do not create Reddit-scale architecture for a small forum.

Avoid:

- microservices
- message queues
- event buses
- distributed caches
- search clusters

until there is a real requirement.

---

# 10. Comments

Comments should be simple.

A comment belongs to:

```text
User
Post
```

and contains:

```text
content
createdAt
updatedAt
```

Keep moderation functionality simple initially.

Do not build an elaborate moderation platform unless explicitly requested.

---

# 11. Authentication

Authentication should be introduced only when required.

Do not build authentication merely because a framework supports it.

The minimum useful model is:

```text
anonymous visitor
        |
        v
authenticated user
        |
        v
administrator
```

Authorization must happen server-side.

Never trust permissions supplied by the browser.

---

# 12. UI Philosophy

The UI should resemble a Unix tool rather than a modern marketing website.

Desired characteristics:

- minimal
- dense
- textual
- utilitarian
- quiet
- highly readable
- predictable
- keyboard-friendly
- low visual noise

Avoid:

- hero sections
- gradient backgrounds
- excessive rounded cards
- giant marketing typography
- decorative illustrations
- unnecessary animations
- glassmorphism
- excessive shadows
- floating UI everywhere
- excessive icons
- fake dashboards
- gamification

The website should not look like a startup landing page.

---

# 13. Visual Language

Use a restrained visual system.

Prioritize:

1. typography
2. spacing
3. hierarchy
4. links
5. code blocks
6. borders
7. subtle metadata

Color should communicate meaning, not decoration.

The design should remain usable in a plain-text mindset.

A page should still make sense if most decorative styling disappeared.

---

# 14. Inspiration

The aesthetic direction may take inspiration from:

- Unix
- terminal interfaces
- man pages
- old-school technical documentation
- engineering blogs
- mailing lists
- GitHub
- Hacker News
- early personal websites
- classic text-oriented Web interfaces

Do not blindly copy any of them.

The goal is not "retro".

The goal is:

> Information-dense software designed by people who care more about the information than the chrome around it.

---

# 15. Navigation

Navigation should be obvious and minimal.

Prefer:

```text
home
blog
forum
about
```

over a large navigation system.

Avoid hamburger menus unless there is a real responsive requirement.

Do not hide important functionality behind decorative UI.

Links should look like links.

---

# 16. Typography

Typography is one of the most important parts of the design.

Optimize for:

- long-form reading
- technical documentation
- code
- comments
- dense information

Use a readable proportional font for normal text and a monospace font for code and technical UI where appropriate.

Do not use typography merely to create visual drama.

Avoid excessive font sizes.

---

# 17. Responsive Design

The application must work on:

- desktop
- tablet
- mobile

However, responsive design should not turn into a separate mobile product.

Prefer fluid layouts and simple breakpoints.

Do not duplicate components merely because the viewport is smaller.

---

# 18. Accessibility

Accessibility is part of correctness.

Use:

- semantic HTML
- proper headings
- proper labels
- keyboard navigation
- visible focus states
- meaningful link text
- sufficient contrast

Do not use a `<div>` when a semantic HTML element exists.

---

# 19. Tailwind

Tailwind is used for styling.

Prefer readable utility composition.

Do not create enormous class strings containing dozens of unrelated utilities.

If the same visual pattern appears repeatedly, extract a component.

Do not create a design-system abstraction for every element.

The goal is not maximum componentization.

The goal is understandable code.

---

# 20. Components

Components should represent meaningful UI concepts.

Good:

```text
PostList
PostCard
CommentList
CommentForm
ForumTopicList
ForumReply
Pagination
```

Bad:

```text
Box
Wrapper
Container2
UniversalCard
GenericContentRenderer
SuperComponent
```

Do not abstract code merely because two files contain similar HTML.

Abstract when the abstraction improves understanding.

---

# 21. Routing

Use Next.js App Router conventions.

Example:

```text
app/
├── page.tsx
├── blog/
│   ├── page.tsx
│   └── [slug]/
│       └── page.tsx
├── forum/
│   ├── page.tsx
│   ├── new/
│   │   └── page.tsx
│   └── [id]/
│       └── page.tsx
└── about/
    └── page.tsx
```

Keep routes predictable.

Do not create deeply nested routing structures without a reason.

---

# 22. API / BFF

Next.js acts as the BFF.

Use:

- Server Components
- Server Actions
- Route Handlers

according to the use case.

Do not create REST endpoints simply because REST endpoints are familiar.

If a mutation can be expressed naturally as a Server Action, consider using one.

If an HTTP endpoint is genuinely required, use a Route Handler.

The browser should never need to understand the database architecture.

---

# 23. Server Actions

Server Actions may be used for mutations such as:

```text
createPost
updatePost
deletePost
createComment
deleteComment
createTopic
createReply
```

Validate all input on the server.

Never assume client-side validation is sufficient.

---

# 24. Validation

All externally supplied data is untrusted.

Validate:

- forms
- URL parameters
- query parameters
- API requests
- Server Action inputs

Validation should happen near the server boundary.

Prefer explicit schemas over scattered manual checks.

---

# 25. Error Handling

Errors should be boring and useful.

Do not hide errors behind generic messages when debugging information can safely be preserved server-side.

User-facing errors should be understandable.

Developer-facing errors should contain enough context to diagnose the problem.

Do not silently swallow errors.

Avoid:

```text
catch (error) {
  return null;
}
```

unless there is a deliberate reason.

---

# 26. Loading States

Use loading states only where they improve the experience.

Do not animate everything.

Prefer:

```text
Loading...
```

or a restrained skeleton when appropriate.

The project does not need cinematic transitions.

---

# 27. Performance

Performance is important, but premature optimization is forbidden.

First make the architecture correct.

Then measure.

Then optimize.

Prefer:

- Server Components
- streaming where useful
- appropriate caching
- efficient database queries
- pagination for large collections
- optimized images when images are actually needed

Do not add Redis, a search engine, or a caching layer without evidence that it is necessary.

---

# 28. SEO

The blog should have basic, correct metadata.

Use:

- meaningful titles
- descriptions
- canonical URLs where appropriate
- Open Graph metadata
- sitemap
- robots configuration

Do not turn SEO into an abstraction-heavy subsystem.

---

# 29. Content Formatting

Technical content should support:

- Markdown
- code blocks
- syntax highlighting
- links
- lists
- tables where useful
- headings
- blockquotes

Code should be visually distinct from prose.

Technical accuracy is more important than visual presentation.

---

# 30. Security

Security is a correctness requirement.

Never commit:

```text
.env
.env.local
API keys
database credentials
private tokens
session secrets
```

Use environment variables for secrets.

Treat all user input as hostile.

Protect:

- authentication
- authorization
- database access
- mutations
- administrative operations

Do not trust:

```text
hidden inputs
cookies alone
client-side state
request parameters
```

for authorization decisions.

---

# 31. Dependencies

Dependency count should remain low.

Before adding a dependency, ask:

1. Do we actually need it?
2. Can the Web platform already do this?
3. Can Next.js already do this?
4. Can React already do this?
5. Can a small local function solve it?
6. Will this dependency remain useful long-term?

Do not install packages because they are fashionable.

Avoid dependency creep.

---

# 32. No VPS

The project intentionally does not use a VPS.

Do not introduce:

- Nginx
- Docker deployment
- systemd
- PM2
- manual Linux server configuration

unless explicitly requested for educational purposes.

The intended deployment architecture is:

```text
GitHub
   ↓
Vercel
   ↓
Next.js
   ↓
Supabase
```

---

# 33. Free-Tier Constraint

The project is designed to operate within free-tier services during development and experimentation.

Primary services:

```text
Vercel Hobby
Supabase Free
GitHub Free
```

Do not introduce paid infrastructure without explicitly informing the user first.

If a feature cannot reasonably operate within the free tier, explain the limitation before implementing a paid dependency.

---

# 34. Git

Keep commits small and meaningful.

Prefer:

```text
feat: add post listing
feat: add comments
fix: prevent duplicate comments
refactor: simplify post query
docs: explain local development
```

Avoid commits such as:

```text
update
changes
stuff
final
final2
fix
```

Do not rewrite Git history unless explicitly requested.

---

# 35. Code Style

Prefer boring TypeScript.

Good code should be understandable without knowing the author's personal tricks.

Prefer:

```ts
const posts = await prisma.post.findMany(...)
```

over unnecessary abstraction such as:

```ts
const result = await RepositoryFactory
  .for(Post)
  .withStrategy(...)
  .execute(...)
```

Do not build frameworks inside the framework.

---

# 36. TypeScript

TypeScript should be used strictly.

Prefer explicit domain types where they improve clarity.

Avoid:

```ts
any
```

unless there is a documented reason.

Do not use type assertions to silence errors without understanding why the type system rejects the code.

Prefer fixing the underlying type problem.

---

# 37. Comments

Comments should explain why, not what.

Bad:

```ts
// Get posts
const posts = await getPosts()
```

Good:

```ts
// Published posts are cached because they are immutable until explicitly edited.
const posts = await getPublishedPosts()
```

If code is difficult to understand only because it is unnecessarily clever, simplify the code instead of writing a large comment.

---

# 38. Documentation

Documentation should be practical.

Prefer:

```text
README.md
docs/
├── architecture.md
├── database.md
├── deployment.md
└── development.md
```

Documentation should explain:

- how to run the project
- how the architecture works
- where data lives
- how deployment works
- important design decisions

Do not document obvious code.

---

# 39. AI Agent Development Model

This project is intentionally AI-assisted.

Claude Code is treated as an engineering agent, not as an autocomplete engine.

The agent must:

1. Understand the existing architecture before modifying it.
2. Search the repository before creating new abstractions.
3. Reuse existing patterns where appropriate.
4. Avoid unnecessary dependencies.
5. Avoid unnecessary files.
6. Avoid changing unrelated code.
7. Explain significant architectural decisions.
8. Keep changes small and reviewable.
9. Run relevant checks after modifications.
10. Never invent project requirements.

---

# 40. CLAUDE.md Authority

This file is the primary project-level instruction set for Claude Code.

When instructions conflict:

```text
explicit user request
        >
CLAUDE.md
        >
existing implementation conventions
        >
agent preference
```

The agent must not override an explicit user request merely because another architecture appears more fashionable.

However, the agent should identify security, correctness, or architectural risks before implementing dangerous changes.

---

# 41. Skills

Project knowledge that is not required for every task should live in Skills.

Do not put every piece of domain knowledge into `CLAUDE.md`.

`CLAUDE.md` should contain stable project-wide rules.

Skills should contain specialized knowledge loaded only when relevant.

Suggested structure:

```text
.claude/
└── skills/
    ├── blog/
    │   └── SKILL.md
    ├── forum/
    │   └── SKILL.md
    ├── database/
    │   └── SKILL.md
    ├── ui/
    │   └── SKILL.md
    └── deployment/
        └── SKILL.md
```

---

# 42. Skill Loading

Do not load every Skill for every task.

Use the smallest relevant knowledge set.

Examples:

### Blog task

Load:

```text
blog
```

Potentially:

```text
database
```

if database changes are involved.

### Forum task

Load:

```text
forum
```

Potentially:

```text
database
```

and:

```text
ui
```

when relevant.

### Deployment task

Load:

```text
deployment
```

Do not load unrelated blog or forum knowledge.

---

# 43. Skill Design

Each Skill should answer:

> What specialized knowledge does an agent need to perform this class of task correctly?

A Skill should contain:

- domain rules
- conventions
- important constraints
- relevant file locations
- examples
- common mistakes
- validation procedures

A Skill should not duplicate `CLAUDE.md`.

---

# 44. Agent Before Coding

Before making a non-trivial change:

1. Inspect the relevant files.
2. Identify existing patterns.
3. Determine whether a Skill is relevant.
4. Understand the data flow.
5. Decide the smallest viable change.
6. Implement.
7. Run relevant checks.
8. Report what changed.

Do not immediately start writing code after reading only the user's last sentence.

---

# 45. Agent Scope Control

Do not modify unrelated files.

If you discover an unrelated issue:

- mention it
- do not automatically fix it

unless the issue blocks the requested task or creates a security/correctness problem.

Avoid opportunistic refactoring.

---

# 46. Refactoring

Refactor when:

- duplication is causing real problems
- the existing abstraction is actively harmful
- the requested feature cannot reasonably be implemented otherwise
- readability significantly improves

Do not refactor merely because the code could theoretically be cleaner.

Small projects should tolerate some duplication.

---

# 47. Testing

Testing should grow with the application.

Do not create a giant test suite before the application has meaningful behavior.

Prioritize tests for:

- authentication
- authorization
- database mutations
- comment creation
- forum posting
- permission boundaries
- important business rules

UI snapshot testing is not automatically required.

---

# 48. Verification

After meaningful code changes, run appropriate checks.

At minimum, where configured:

```text
typecheck
lint
tests
build
```

Do not claim a check passed unless it was actually run.

Do not claim a feature works merely because the code looks correct.

---

# 49. Environment

The development environment is expected to use:

```text
macOS
Node.js
pnpm
Git
```

Do not assume Linux-specific commands or paths unless explicitly requested.

When documenting commands, prefer portable commands where possible.

---

# 50. File System Hygiene

The project values a clean development environment.

Do not create temporary files in arbitrary locations.

Do not add generated artifacts to Git unless they are intentionally part of the project.

Understand where tools place:

- dependencies
- caches
- generated files
- build output
- database artifacts

When introducing a tool that creates files automatically, document the location if it matters.

---

# 51. Local Development

The primary development command should remain simple:

```bash
pnpm dev
```

A new developer should be able to understand the basic workflow quickly:

```text
clone
 ↓
pnpm install
 ↓
configure environment
 ↓
pnpm dev
```

Avoid requiring a large local infrastructure stack.

---

# 52. Deployment

The intended deployment flow:

```text
local development
      ↓
git commit
      ↓
git push
      ↓
GitHub
      ↓
Vercel
      ↓
production
```

Database:

```text
Next.js
   ↓
Prisma
   ↓
Supabase PostgreSQL
```

Production configuration must be documented.

---

# 53. Feature Development

When adding a feature, prefer this order:

```text
1. Data model
2. Server-side behavior
3. Validation
4. UI
5. Error handling
6. Loading state
7. Tests
8. Documentation
```

Do not begin by designing elaborate UI mockups for backend-driven features.

---

# 54. Feature Creep

Do not add features merely because similar websites have them.

The question is not:

> "What does Reddit have?"

The question is:

> "What does this project actually need?"

A smaller system is preferable when it provides the same value.

---

# 55. Product Philosophy

This project is not trying to become:

- a startup
- a SaaS platform
- a social network
- a design showcase
- a feature-complete CMS

It is a personal engineering project that happens to be public and interactive.

The project should remain small enough that one engineer can understand the whole system.

---

# 56. Complexity Budget

Every feature consumes complexity.

Before adding infrastructure, ask:

```text
Does this solve a real problem?
Does the current architecture fail without it?
Can the same result be achieved more simply?
Will I understand this code six months from now?
Can I delete it easily?
```

If the answer is unclear, prefer not adding it.

---

# 57. Anti-Patterns

Avoid these unless explicitly justified:

```text
microservices
event-driven architecture
CQRS
DDD everywhere
repository pattern everywhere
dependency injection frameworks
global state
excessive client-side rendering
premature caching
premature optimization
Redis
Kafka
Docker
Kubernetes
GraphQL
custom design systems
large UI component libraries
```

These technologies are not forbidden.

They are simply not defaults.

---

# 58. The Simplest Working System

When choosing between:

```text
A: simple solution
B: sophisticated solution
```

choose A unless B provides a concrete, measurable benefit.

The burden of proof belongs to complexity.

---

# 59. Engineering Decision Rule

When uncertain, prefer the solution that is:

```text
smaller
more explicit
more local
more observable
more reversible
more boring
```

A boring system that works is a successful system.

---

# 60. Final Principle

The project should feel like this:

```text
$ cat README.md
$ less article.md
$ git log
$ grep keyword
$ curl endpoint
$ pnpm dev
```

Not this:

```text
WELCOME TO THE FUTURE

✨ AI-POWERED
🚀 NEXT-GEN
⚡ ULTRA-FAST
🎨 BEAUTIFUL
🔥 COMMUNITY
```

The website should respect the user's attention.

The content should be allowed to speak for itself.

When there is a choice between making the system more impressive and making the system more understandable:

> Make it more understandable.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
