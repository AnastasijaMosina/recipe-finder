# Notes: AI Voice (STT) Decision

## Browser STT vs Azure STT

| Dimension                  | Browser STT (Web Speech API / device-native) | Azure STT (Azure AI Speech / Foundry-integrated flow) |
| -------------------------- | -------------------------------------------- | ----------------------------------------------------- |
| Implementation speed       | Very fast for MVP                            | Slower initial setup                                  |
| Implementation difficulty  | Low                                          | Medium to High                                        |
| Real-time transcript UX    | Good (interim results easy)                  | Good (streaming), depends on network                  |
| Accuracy consistency       | Varies by browser/OS/device                  | More consistent across users/devices                  |
| Language support           | Browser-dependent                            | Broad and configurable                                |
| Cross-browser reliability  | Uneven (not equal support everywhere)        | More predictable if handled via backend               |
| Operational control        | Limited                                      | Strong (centralized config, monitoring, retries)      |
| Observability              | Weak to medium                               | Strong (service telemetry, centralized logs)          |
| Vendor cost                | Low direct cloud cost                        | Usage-based cloud cost                                |
| Hidden cost                | QA/support for browser differences           | Cloud spend and infra complexity                      |
| Scalability for production | Good for lightweight scenarios               | Better for scale and enterprise use                   |
| Offline/local behavior     | Sometimes possible                           | Generally cloud-dependent                             |

## Security Considerations

### Browser STT

- Mic permission prompt is handled by browser; show clear recording state in UI.
- Harder to standardize data handling behavior across browsers and devices.
- Lower backend exposure if audio never passes your servers.
- Limited centralized auditing and policy enforcement.
- Treat transcript text as sensitive user input and avoid over-logging.

### Azure STT

- Stronger enterprise governance (region selection, RBAC, key rotation, policy controls).
- Centralized security posture with backend-managed auth, rate limits, and logging policy.
- Better auditability and incident response through central telemetry.
- Requires strict secret handling:
  - Keep keys server-side only.
  - Prefer short-lived tokens for clients.
  - Never expose long-lived secrets to the browser.
- Define retention policy for audio/transcripts and align with privacy requirements.

## Recommendations

### Which to choose first

1. Start with Browser STT for fast UX validation:
   - Add mic button and recording states.
   - Show interim transcript in real time.
   - Use manual Send for final transcript.

2. Move to Azure STT when you need:
   - Consistent multilingual quality.
   - Reliable cross-browser behavior.
   - Enterprise security and compliance.
   - Strong observability and operational control.

### Practical rollout path

1. Build a provider abstraction from day one (for example, `SpeechProvider`).
2. Implement Browser STT first behind a feature flag.
3. Add Azure STT as second provider without changing chat UI contracts.
4. Gradually shift traffic to Azure based on quality and reliability metrics.

## Quick Decision Rule

Use Browser STT if:

- Time-to-market and low cost are top priority.
- It is a pilot/internal release.
- Some browser variability is acceptable.

Use Azure STT if:

- Production reliability is critical.
- Non-English quality must be strong and consistent.
- Security, compliance, and governance are required.
- You need centralized monitoring and controls.
