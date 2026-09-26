# External file storage rules

## Responsibility

External S3-compatible object storage owns mutable uploaded media and documents; the Media module/API owns validated
metadata, authorization, and controlled upload/download capabilities.

## Non-responsibility

Object storage does not contain compiled UI bundles or immutable project assets shipped in the project image, and bucket
paths are not a public application data model.

## Required rules

- Derive bucket/account configuration from validated server secrets and project scope; never from browser or MCP input.
- Generate opaque object keys under a server-controlled project prefix. Store an asset identifier and metadata in the
  project database rather than exposing provider credentials or treating a URL as authority.
- Validate declared size/type before upload and verify observed size/type/checksum after completion. Define malware or
  content inspection when project risk requires it.
- Use short-lived, least-privilege signed upload/download requests. Private is the default; public delivery requires an
  approved policy and immutable cache behavior.
- Make completion/deletion retry-safe and auditable. Define orphan cleanup and database/object consistency recovery.

## Limitations

S3 compatibility does not guarantee identical conditional-write, event, multipart, encryption, retention, or consistency
semantics across providers. The approved architecture must identify supported capabilities and limits.

## Correct example

```ts
const upload = await MediaService.createUpload({
  actor,
  project,
  input: CreateUploadInput.parse({ fileName, contentType, size }),
});
```

The service creates an opaque asset ID and project-prefixed object key, then returns a short-lived constrained upload
capability. The client never receives storage credentials or chooses the authoritative object key.

## Avoid

- Accepting a bucket, project prefix, arbitrary object key, ACL, or credential from the caller.
- Storing mutable uploads in the project image/container filesystem.
- Putting compiled UI bundles, logos shipped with a release, or other immutable application assets in mutable storage.
- Trusting filename extensions, client MIME types, or a successful upload as validation of content.

## Verification

Test project isolation, key containment, upload constraints, expiry, private access, checksum/type mismatch, duplicate
completion, delete retries, orphan recovery, safe logs, and provider-error mapping with an injected storage boundary.
