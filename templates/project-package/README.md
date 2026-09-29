# {{Project title}}

> Status: **{{Implemented | Measured | Planned}}** — see `docs/evaluation-report.md` for what has been measured.

{{One-paragraph summary: the operational problem and the approach.}}

## Architecture
See `architecture/` for the diagram source and exported image. Trust boundaries are marked.

## Quick start
```bash
cp .env.example .env
docker compose up -d --build
# seed demo data
# run evaluation
docker compose down -v   # teardown
```

## Evaluation
Dataset, baselines, metrics, and how to rerun them: `docs/evaluation-report.md`.

## Limitations
What this project does **not** prove: {{list}}.

## Security
Threat model: `docs/threat-model.md`. No real customer data, employer code, or secrets are included.

## License
See `LICENSE`.
