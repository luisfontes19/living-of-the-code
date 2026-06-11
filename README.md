# Living of the Code (LOC)

Developer machines are high-value targets. They hold source code, credentials, cloud access keys, and direct paths into production infrastructure — yet the tools developers use every day are rarely treated as an attack surface.

LOtD catalogs attack techniques that abuse legitimate developer tooling: IDE features, package managers, version control hooks, AI agents, and configuration files. These are not exploits — they use intended functionality, which makes them hard to detect and easy to overlook in security reviews.

The goal is to raise awareness among developers and security teams about how their everyday workflows can be weaponized, and to give defenders a concrete reference for what to look for.

## Defensive Tooling

- VS Code Watchtower extension: https://marketplace.visualstudio.com/items?itemName=luisfontes19.watchtower
  - Helps detect many of the techniques documented in this project directly in editor workflows.

## Contributing

Add a new technique by creating a `.yml` file in `data/` with the following structure:

```yaml
name: Technique Name
id: technique-id
description: >
  Short description.
author: Your Name
tags:
  - relevant
  - tags

exploitation: |
  Full explanation of the attack vector, with code examples.

references:
  - url: https://example.com
    description: Reference description
```

## Development

```bash
npm install
npm run dev     # build + watch
npm run serve   # build + serve on :4000
```

## License

MIT
