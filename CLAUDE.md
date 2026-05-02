## gstack (REQUIRED — global install)

**Before doing ANY work, verify gstack is installed:**

```bash
test -d ~/.claude/skills/gstack/bin && echo "GSTACK_OK" || echo "GSTACK_MISSING"
```

If GSTACK_MISSING: STOP. Do not proceed. Tell the user:

> gstack is required for all AI-assisted work in this repo.
> Install it:
> ```bash
> git clone --depth 1 https://github.com/garrytan/gstack.git ~/.claude/skills/gstack
> cd ~/.claude/skills/gstack && ./setup --team
> ```
> Then restart your AI coding tool.

Do not skip skills, ignore gstack errors, or work around missing gstack.

Use `/browse` from gstack for all web browsing. Never use `mcp__claude-in-chrome__*` tools.

### Available skills

| Skill | Purpose |
|---|---|
| `/office-hours` | Product brainstorm & problem framing |
| `/plan-ceo-review` | CEO/founder-mode plan review |
| `/plan-eng-review` | Engineering plan review |
| `/plan-design-review` | Design plan review |
| `/design-consultation` | Design consultation |
| `/design-shotgun` | Rapid design exploration |
| `/design-html` | HTML/CSS design implementation |
| `/review` | Code review |
| `/ship` | Ship & create PR |
| `/land-and-deploy` | Land PR and deploy |
| `/canary` | Canary deploy |
| `/benchmark` | Benchmark performance |
| `/browse` | Headless browser — use this for ALL web browsing |
| `/connect-chrome` | Connect to Chrome browser |
| `/qa` | Full QA pass |
| `/qa-only` | QA without implementation |
| `/design-review` | Visual design review |
| `/setup-browser-cookies` | Set up browser cookies |
| `/setup-deploy` | Set up deployment |
| `/setup-gbrain` | Set up GBrain memory |
| `/retro` | Team retrospective |
| `/investigate` | Debug & investigate issues |
| `/document-release` | Document a release |
| `/codex` | Codex agent tasks |
| `/cso` | Chief of Staff operations |
| `/autoplan` | Auto-generate a plan |
| `/plan-devex-review` | Developer experience plan review |
| `/devex-review` | Developer experience review |
| `/careful` | Warn before destructive commands |
| `/freeze` | Lock edits to one directory |
| `/guard` | Guard against unintended changes |
| `/unfreeze` | Unlock directory edits |
| `/gstack-upgrade` | Upgrade gstack |
| `/learn` | Log a learning for future sessions |

### Skill routing

When the user's request matches an available skill, invoke it via the Skill tool. When in doubt, invoke the skill.

- Product ideas / brainstorming → `/office-hours`
- Strategy / scope → `/plan-ceo-review`
- Architecture → `/plan-eng-review`
- Design system / plan review → `/design-consultation` or `/plan-design-review`
- Full review pipeline → `/autoplan`
- Bugs / errors → `/investigate`
- QA / testing site behavior → `/qa` or `/qa-only`
- Code review / diff check → `/review`
- Visual polish → `/design-review`
- Ship / deploy / PR → `/ship` or `/land-and-deploy`
