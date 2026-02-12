# Project Context

## Purpose

kaiyanTool is a multi-project workspace containing AI-powered content creation tools for making short videos and motion comics. The workspace includes two main applications:

- **BigBanana-AI-Director**: An AI-powered industrial workbench for creating short motion comics and videos using a "Script-to-Asset-to-Keyframe" workflow. It enables creators to generate complete short dramas from a single sentence, with precise control over character consistency, scene continuity, and camera movements.

- **Toonflow-app**: An AI short drama factory built as an Electron desktop application. It converts novels and stories into structured scripts, generates character and scene assets, creates storyboards, and produces AI-generated video clips.

Both applications target creators who want to efficiently produce video content from text scripts, with emphasis on industrialized workflows that maintain consistency across shots and scenes.

## Tech Stack

### BigBanana-AI-Director
- **Frontend**: React 19.2.0, TypeScript 5.8.2
- **Build Tool**: Vite 6.2.0
- **Styling**: Tailwind CSS (Sony Industrial Design Style)
- **Icons**: Lucide React
- **Storage**: IndexedDB (client-side, no backend dependency)
- **AI Models**:
  - Text/Logic: GPT-5.1, GPT-5.2
  - Vision: Gemini 3 Pro, Nano Banana Pro
  - Video: Sora-2, Veo 3.1 (with keyframe interpolation support)
- **AI Integration**: AntSK API platform (unified API with <20% official pricing)
- **Deployment**: Docker support (docker-compose, nginx)

### Toonflow-app
- **Backend**: Node.js 23.11.1+, Express 5.2.1
- **Language**: TypeScript 5.9.3
- **Desktop Framework**: Electron 40.0.0
- **Database**: SQLite (better-sqlite3 12.6.2, Knex 3.1.0)
- **AI Integration**: Multi-provider support via LangChain and Aigne
  - Anthropic, OpenAI, Google, DeepSeek, Qwen, Zhipu
- **Image Processing**: Sharp 0.34.5
- **Package Manager**: Yarn
- **Process Management**: PM2 (for production deployment)

## Project Conventions

### Code Style

**BigBanana-AI-Director**:
- TypeScript strict mode enabled
- React functional components with hooks
- Component-based architecture organized by feature/stage
- Uses path alias `@/*` for imports
- Base64 encoding for all media assets (images, videos) stored in IndexedDB
- Chinese comments and variable names where appropriate for domain context

**Toonflow-app**:
- TypeScript strict mode with ESNext target
- Route-based architecture under `src/routes/`
- Organized by feature domains: assets, novel, outline, storyboard, video, etc.
- Database types auto-generated using `@rmp135/sql-ts`
- Path alias `@/*` for imports from `src/`
- Uses Express middleware pattern
- Async/await for all database operations

### Architecture Patterns

**BigBanana-AI-Director**:
- **Stage-based workflow**: Projects progress through stages (script → assets → director → export → prompts)
- **Keyframe-driven approach**: Generate start/end frames first, then interpolate video
- **Context-aware generation**: AI reads character and scene reference images to maintain consistency
- **Local-first architecture**: All data stored client-side in IndexedDB for privacy
- **Component organization**: Each stage has its own component directory with related utilities and constants
- **Service layer**: Separate services for storage, AI models, rendering, exports

**Toonflow-app**:
- **MVC pattern**: Routes handle requests, services contain business logic
- **Agent-based AI**: Dedicated agents for outline generation and storyboard creation
- **RESTful API**: Express routes with middleware for authentication and validation
- **Electron architecture**: Main process (backend) + renderer process (frontend)
- **SQLite with Knex ORM**: Type-safe database queries with migrations
- **Background task queue**: For long-running AI generation tasks

### Testing Strategy

- **BigBanana-AI-Director**: Currently no automated test framework configured
- **Toonflow-app**: Currently no automated test framework configured
- Manual testing focuses on:
  - AI generation quality (character consistency, scene continuity)
  - IndexedDB data persistence
  - API integration with various AI providers
  - Docker deployment and startup

### Git Workflow

- **BigBanana-AI-Director**: CC BY-NC-SA 4.0 license (non-commercial only)
- **Toonflow-app**: AGPL-3.0 license (commercial use allowed with attribution)
- Branching strategy not explicitly documented
- Commits should follow conventional commit format when possible
- Both projects hosted on GitHub with mirrors on Gitee for Chinese users

## Domain Context

### Core Concepts

**Character Consistency**:
- Characters have reference images (base64) that constrain AI generation
- Support for multiple character variations (wardrobe systems, different outfits)
- Characters are referenced by ID across all shots and scenes

**Scene Continuity**:
- Scenes have reference images to maintain lighting/atmosphere consistency
- All shots within a scene share the same scene reference

**Keyframe Workflow**:
- Start frame: Initial state of the shot
- End frame: Optional final state (for camera movements, character actions)
- Video interpolation: AI generates smooth transition between keyframes

**Asset Types**:
- Characters: Reference images, variations (outfits), visual prompts, negative prompts
- Scenes: Location, time, atmosphere, reference images
- Shots: Action summary, dialogue, camera movement, shot size, character list
- Keyframes: Start/end frames with visual prompts and generated images
- Videos: Generated clips with duration, motion strength, model info

### Project State Management

**BigBanana-AI-Director**:
- Projects stored in IndexedDB with metadata (created, last modified, current stage)
- Render logs track all API calls (model used, tokens consumed, duration, status)
- Support for project export/import as JSON
- Asset library for reusable characters and scenes across projects

**Toonflow-app**:
- SQLite database with tables for novels, outlines, scripts, storyboards, videos
- User management with authentication
- Project-based organization with task tracking

### AI Model Integration

**AntSK API Platform**:
- Unified OpenAI-compatible API interface
- Cost-effective pricing (<20% official rates)
- Models: GPT-5.1/5.2 (text), Gemini 3 Pro (images), Sora-2/Veo 3.1 (video)
- Supports both sync and async APIs

**Model Selection**:
- Chat models: For script parsing, character analysis, prompt generation
- Image models: For generating character/scene reference images, keyframes
- Video models: For generating clips from keyframes (i2v) or text-to-video (t2v)

## Important Constraints

### Technical Constraints

**BigBanana-AI-Director**:
- All media must be Base64 encoded (no external file storage)
- IndexedDB browser storage limits (typically 50-500MB depending on browser)
- No backend server - all processing happens client-side
- Must work offline after initial load (except for API calls)
- Browser compatibility: Modern browsers with IndexedDB support

**Toonflow-app**:
- Electron app requires desktop environment (Windows currently supported)
- SQLite file location: `userData` directory in production, `db.sqlite` in development
- Database migrations handled via Knex and custom init/fix scripts
- Requires AI provider API keys for full functionality

### Business Constraints

**BigBanana-AI-Director**:
- CC BY-NC-SA 4.0 license prohibits commercial use without explicit permission
- Based on open-source CineGen-AI project
- Requires AntSK API key (third-party service)

**Toonflow-app**:
- AGPL-3.0 license requires derivative works to be open-source
- Commercial use allowed but requires AGPL compliance
- Sponsored by 算能云 for compute resources

### Performance Constraints

- AI generation is time-consuming; must handle long-running operations
- Image generation: 10-30 seconds typical
- Video generation: 30-120 seconds typical
- Must show progress indicators and handle timeouts gracefully
- Implement retry logic for failed API calls (axios-retry)

## External Dependencies

### AI Model Providers

**AntSK API Platform** (BigBanana-AI-Director):
- URL: https://api.antsk.cn
- Services: Text generation, image generation, video generation
- Authentication: API key (ANTSK_API_KEY)
- Models: GPT-5.1, GPT-5.2, Gemini 3 Pro, Sora-2, Veo 3.1

**Multiple AI Providers** (Toonflow-app):
- Anthropic Claude 3.5 Sonnet
- OpenAI GPT models
- Google Gemini
- DeepSeek
- Qwen (Alibaba)
- Zhipu AI
- Nano Banana Pro (images)
- Sora/豆包 (video)

### Build & Deployment Tools

**BigBanana-AI-Director**:
- Docker, Docker Compose
- Nginx for production serving
- Vite for development and build

**Toonflow-app**:
- Electron Builder for desktop packaging
- PM2 for production process management
- Nodemon for development hot reload

### Third-Party Libraries

**BigBanana-AI-Director**:
- JSZip 3.10.1: For project export functionality
- Lucide React: Icon set

**Toonflow-app**:
- Express: Web framework
- Better-SQLite3: SQLite database
- Knex: SQL query builder
- Sharp: Image processing
- LangChain: AI agent framework
- Aigne: AI API middleware
- Zod 4.3.5: Schema validation
- Axios + axios-retry: HTTP client with retry logic
