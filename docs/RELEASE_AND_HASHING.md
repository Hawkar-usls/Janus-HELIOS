# JANUS HELIOS — Closing Release & Hashing Procedure

The purpose of a closing release is to make the exact acquired snapshot reproducible and unambiguous.

## Why this exists

A transaction should never rely on phrases such as `the current repository` or `latest version`. Those descriptions can change after signing.

The closing package should freeze one exact repository state.

## Recommended closing process

1. Stop feature changes on the agreed release branch.
2. Run the complete agreed test suite on that exact branch/commit.
3. Record runtime/tool versions and full test output.
4. Record the exact Git commit SHA and tree SHA.
5. Generate a file manifest containing path, size and SHA-256 for every delivered file.
6. Generate SHA-256 for the manifest itself.
7. Create a release/tag that identifies the transaction snapshot.
8. Prefer a cryptographically signed Git tag/commit or equivalent signing mechanism when available.
9. Place the manifest, test report and signatures in the closing data room.
10. Transfer the repository into a buyer-controlled organization/account only after the agreed payment/escrow condition is satisfied.

## Closing manifest schema

Recommended machine-readable structure:

```json
{
  "schema": "janus.helios.closing-manifest.v1",
  "repository": "Hawkar-usls/Janus-HELIOS",
  "commit_sha": "<40-hex>",
  "tree_sha": "<40-hex>",
  "release_tag": "<tag>",
  "generated_at_utc": "<ISO-8601>",
  "runtime": {
    "node": "<version>"
  },
  "test": {
    "command": "npm test",
    "exit_code": 0,
    "report_sha256": "<64-hex>"
  },
  "files": [
    {
      "path": "src/helios-router.js",
      "bytes": 0,
      "sha256": "<64-hex>"
    }
  ]
}
```

## Signing boundary

The repository currently contains ordinary GitHub commits, which may be unsigned. A transaction-preparation document must not claim that a release is signed unless a real signature exists and can be independently verified.

`SIGNED_RELEASE = REQUIRED_FOR_PREFERRED_CLOSING`, not `SIGNED_RELEASE = ALREADY_DONE`.

## Test truth boundary

The presence of test files is not evidence that they passed.

A closing report must identify:

```text
commit SHA
runtime version
command
start/end time
exit code
stdout/stderr or artifact hash
```

Only an exit code and report from the exact closing snapshot support a `PASS` statement.

## Hashes do not replace legal assignment

A hash proves which bytes were frozen. It does not, by itself, transfer copyright, trademark, contract rights or ownership. The signed definitive agreement performs the legal transfer; the manifest defines the technical object transferred.
