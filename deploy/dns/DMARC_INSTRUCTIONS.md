# LP-RMYNJ7: DMARC & SPF Configuration Instructions

**Domain:** `auracareer.duckdns.org`  
**Purpose:** Prevent email spoofing by configuring protective SPF and DMARC policy records.

---

### Step 1: SPF Record (Domain does not send email)
Since `auracareer.duckdns.org` is a web application and does NOT send outbound email, set the following TXT record on the root domain:

| Record Type | Host / Name | Value | TTL |
| :--- | :--- | :--- | :--- |
| **TXT** | `@` (or `auracareer.duckdns.org`) | `v=spf1 -all` | 3600 |

*Explanation: `v=spf1 -all` explicitly states that no IP addresses are authorized to send email from this domain, instructing receiving mail servers to reject unauthorized senders.*

---

### Step 2: DMARC Policy Record
Create a TXT record at `_dmarc.auracareer.duckdns.org`:

#### Initial / Staged Policy (Monitoring & Quarantine):
| Record Type | Host / Name | Value | TTL |
| :--- | :--- | :--- | :--- |
| **TXT** | `_dmarc` (or `_dmarc.auracareer.duckdns.org`) | `v=DMARC1; p=quarantine; sp=quarantine; aspf=s;` | 3600 |

#### Fully Enforced Policy (Reject Spoofed Email):
Once aggregate reports verify no legitimate senders are impacted, edit the TXT record to `p=reject`:
| Record Type | Host / Name | Value | TTL |
| :--- | :--- | :--- | :--- |
| **TXT** | `_dmarc` (or `_dmarc.auracareer.duckdns.org`) | `v=DMARC1; p=reject; sp=reject; aspf=s;` | 3600 |

---

### DuckDNS Specific Note:
If managing via DuckDNS dashboard or DuckDNS API:
- Log in to [duckdns.org](https://www.duckdns.org).
- Locate domain `auracareer`.
- In the `txt` field, input:
  `v=spf1 -all`
- Or via HTTP GET:
  `https://www.duckdns.org/update?domains=auracareer&token=<DUCKDNS_TOKEN>&txt=v=spf1 -all`
