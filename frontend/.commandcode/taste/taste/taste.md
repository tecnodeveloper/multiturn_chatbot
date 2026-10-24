# Taste
- Wants reported bugs / findings (e.g. from another agent or reviewer) independently verified against the actual code before they are accepted or fixed, rather than taken at face value. Confidence: 0.6
- Prefers fixing a list of issues incrementally in small ordered batches (e.g. "first 3 first") rather than all at once. Confidence: 0.5
- Wants each fix accompanied by an explicit written explanation of the error, its root cause, and the solution applied — not just the code change. Confidence: 0.6
- Prefers proper root-cause/design fixes over patches, and wants the underlying design gap investigated and laid out with options/trade-offs before any code is written, so they can make an informed decision. Confidence: 0.75
- Wants git commit messages to be short, precise and meaningful (concise summary with a bulleted body of the substantive changes). Confidence: 0.55
- Works by having the assistant author a self-contained, phase-structured implementation "command" (a task spec for an AI coding agent to execute) rather than applying edits directly, and wants that command explicit enough for the executing model to follow without guessing. Confidence: 0.5
