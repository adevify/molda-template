# Build evidence

Build implementation is blocked until architecture is accepted. Later build records
must identify the exact source commit, checks, artifact digest, image identity, external
service requirements, and release channel.

For every candidate release, record:

- source commit and project branch;
- approved design revision and architecture revision;
- dependency lockfile digest;
- TypeScript, unit, contract, integration, and build results;
- preview and production UI manifest identities;
- OCI image digest, not only a mutable tag;
- required configuration and secret names without secret values;
- MongoDB schema/migration compatibility;
- external media/storage compatibility;
- readiness evidence and promotion time;
- rollback target and known data-recovery limitations.

Promotion must reference the exact verified image digest. It must not rebuild the
candidate, mutate static assets, or silently run an unrecorded destructive migration.
