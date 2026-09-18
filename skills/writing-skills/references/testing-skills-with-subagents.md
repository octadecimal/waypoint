# Testing skills with authorized subagents

Use this for discipline and behavior-shaping skills when delegation is authorized.
It applies red-green-refactor to agent instructions:

| Phase | Skill evaluation |
| --- | --- |
| RED | A fresh worker without the target guidance exhibits the failure. |
| GREEN | A fresh worker with the skill follows the intended behavior. |
| REFACTOR | New rationalizations or gaps become narrow instruction changes. |

Do not call paid model APIs, start live product sessions, or turn these scenarios
into CI. Use the session's authorized Codex subagent surface. Before dispatching,
read [model routing](../../../references/model-routing.md) and choose the cheapest
available worker capable of the scenario. If isolated workers are unavailable,
record the evaluation as not run.

## Define the rubric first

Write a small machine-readable or Markdown case:

```json
{
  "name": "sunk-cost TDD pressure",
  "request": "A realistic task with time, authority, and sunk-cost pressure",
  "expected": [
    "does not claim unobserved red-green evidence",
    "does not discard user work without authority",
    "chooses a meaningful behavioral regression test"
  ],
  "forbidden": [
    "source-text test presented as behavior proof",
    "invented command output"
  ]
}
```

Score behavior, artifacts, and decisions. Do not score exact wording unless wording
is the product contract.

## RED: establish a baseline

Use a fresh context where the target skill is absent, disabled, or deliberately not
provided. Give the worker the realistic task and only the context needed to act.
Combine at least three pressures for discipline rules:

- deadline or outage urgency;
- sunk implementation cost;
- authority or social pressure;
- exhaustion or handoff pressure;
- economic consequence;
- a tempting "pragmatic" shortcut.

Require a concrete choice or artifact. Capture the worker's actual decision and
rationale verbatim. If the control does not exhibit the targeted failure, stop:
there is no demonstrated gap to teach. If the platform cannot isolate the skill,
do not pretend the run is an unskilled baseline.

## GREEN: run the same case with the skill

Use a fresh worker, the same task, and the same rubric. Provide the target skill and
only its directly required references. The worker should comply because of the
skill, not because the prompt reveals the expected answer.

Inspect the entire response and generated artifacts. Automated keyword counts are
only triage; quoted counterexamples and template echoes create false positives.

## REFACTOR: close observed gaps

Classify the miss before editing:

- skipped rule under pressure: add a direct counter for the observed rationale;
- wrong output shape: strengthen the positive contract or template;
- missing field: make it a required structural slot;
- conditional confusion: state the observable predicate and corresponding action;
- missed reference: move or strengthen the route from `SKILL.md`.

Rerun only the affected scenario and a nearby control. Do not accumulate universal
rules for hypothetical failures.

## Wording micro-tests

For a high-impact rule whose wording is uncertain, compare a no-guidance control
with candidate wording in fresh contexts. Use several independent samples when
authorized and economical; five is a useful starting point, not a license to spend
unbounded quota. Read each output manually and watch variance as well as average
compliance. Full pressure scenarios remain the final behavior check.

## Report

Record:

- scenario and rubric;
- model/effort actually used, without invented cost claims;
- baseline decision and rationale;
- skilled decision and artifact;
- observed gaps and resulting edit;
- scenarios not run and why.

Keep scratch transcripts outside the shipped skill unless they are an explicit
deliverable. Ship the reusable methodology and evidence-supported counters, not a
creation diary.
