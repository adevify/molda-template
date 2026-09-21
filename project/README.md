# Project record

This folder is the canonical, versioned workflow record for the customer project.
Control-plane JSON may cache a read projection, but it must never be the only copy of
accepted questions, answers, approvals, or specifications.

- `project.md`: immutable identity and original brief
- `workflow.md`: current gate and revisions
- `surveys/project.md`: project discovery questions and accepted answers
- `surveys/design.md`: design questions and accepted answers
- `design/approval.md`: preview revision and explicit approval
- `surveys/business-flow.md`: behavior questions and accepted answers
- `architecture/specification.md`: post-approval architecture
- `build/README.md`: implementation/build evidence

Each accepted change is committed on the project-key branch.
