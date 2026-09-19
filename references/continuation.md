# Continue until the authorized stopping point

Before a coordinator's final response, check: **Is there authorized, unblocked
work remaining toward this task's agreed outcome?** If yes, perform it. Use
commentary for an acknowledgement or progress update and continue with the next
tool action. A plan, completed preview, worker report, local pass, or pending CI
is not by itself the end of an implementation task.

End the turn when the requested outcome is complete, a genuine human decision or
testing checkpoint is reached, the user asks to stop, or no authorized action can
advance the task because of a concrete blocker. Explain the decision or blocker
and what it prevents. Follow host limits and higher-priority instructions; this
rule grants no new authority and does not permit unlimited retries or busy polling.
If a tool/context limit forces a handoff, preserve the checkpoint and say exactly
what remains rather than claiming completion.

For an intentional pause, identify its purpose plainly: design review, missing
information, hands-on testing, or merge approval. Say what the user needs to do
and which action their answer unlocks. A status update is not an approval request.

Before calling the outcome complete, compare it with the original user request
and later explicit scope decisions, not just the execution plan or worker tasks.
Verify each requested outcome, honor explicit exclusions, and continue any omitted
authorized work. A requirement disappearing from a plan is not a scope reduction.

## Resolve approvals in context

Before requesting a decision, record the pending question, artifact/revision,
options when relevant, existing authorization, and the next action each answer
unlocks in the [delivery checkpoint](delivery-checkpoint.md). Say clearly what the
user is reviewing and what happens after approval.

Interpret "ok", "looks good", or "option B" against that specific pending
question. When the answer resolves it, record the answer and source, clear the
pending decision, and execute the next authorized task in the same turn. Do not
ask for another acknowledgement or end with "next we should implement".

After compaction, reconcile that question and revision with the latest user reply
and live state. If several decisions are pending, the artifact changed materially,
or the reply cannot be mapped unambiguously, clarify only the unresolved decision
and continue independent work. Never invent an approval from a stale checkpoint.
Choosing a visual option does not override design-only or plan-only instructions.
Merge still requires hands-on testing and explicit approval of the current
revision under [completion rules](ci-completion.md).

## Keep worker handoffs internal

When a worker returns, the coordinator reads its report, inspects the actual diff
and verification evidence, then accepts it or sends a focused repair back to that
worker. Continue dependent tasks, integration, and delivery without waiting for
the user to acknowledge the worker's completion. A dispatched worker may end when
its bounded assignment is done; the coordinator's completion check covers the
whole authorized task. Never convert a worker's claim into verified success.

Waiting for workers is ongoing work: use supported notifications/bounded waits,
do useful independent work, and follow the [progress guidance](ci-completion.md#progress-without-repetition).
Full worker slots call for reuse or waiting, not a new user approval gate.

## Ask only questions that change the outcome

Use repository conventions and reasonable defaults for reversible implementation
details such as test names or equivalent internal structure. Ask when the answer
materially affects scope, acceptance criteria, a meaningful design choice, safety,
external commitments, or missing authority and cannot be established from current
evidence. A required human design review remains a valid pause.

Ask the concrete question, give a recommendation when justified, and identify the
dependent work. Use asynchronous input when supported and continue independent
authorized work while it is pending. Silence or elapsed time is not approval;
never proceed with the dependent action until a required answer arrives. Existing
authorization persists across phase changes and does not need routine renewal.

## Learn from real tasks

During the next few user-assigned tasks, record observed unnecessary stops in the
local checkpoint: the stalled action, prior authority, user nudge, cause if known,
and outcome after resuming. Count only nudges that were needed despite existing
authority and no blocker; required reviews, new instructions, and status questions
are not failures. Use actual message/tool evidence and mark uncertain causes.

Review those observations before adding more workflow rules. Turn a demonstrated
miss into a focused regression case and rerun the relevant control. Keep these
notes local, omit secrets, and use existing checkpoints rather than adding
telemetry or launching unrelated tasks to collect measurements. No observed
failure means no new rule is needed.
