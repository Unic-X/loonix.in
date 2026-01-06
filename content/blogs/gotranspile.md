---
title : Moving from Render to Cloudflare Workers
date: 2025-12-20
description: "Technical analysis of Node.js to Cloudflare Workers + Go WASM Migration"
tags : ["tech","cloudflare","workers","wasm", "golang"]
author: Arman Singh Kshatri
---

This post documents a forced but ultimately enlightening migration of a production-style Node.js backend from Render to Cloudflare Workers. What started as a simple deployment decision ended up becoming a deep rewrite across runtime, language, database, and execution model.

You can check out the live full-stack deployment [here](https://nrchan.vercel.app). The backend is running on Cloudflare Workers, and the frontend is hosted on Vercel.

---
{{<landscape "rembrandt.jpg" "image showing tobias exile" "max-width:35%">}}

### 1. Background: Why the Migration Happened

The original backend was a Node.js server running on Render. Over time, it evolved into something closer to a real production deployment: background jobs, persistent connections, and integrations with external services.

Render eventually terminated the service, citing violations of their Terms of Service specifically around production-like workloads and external service usage on plans not meant for it. By that point, a partial rewrite into Go was already underway for performance and correctness reasons, so reverting back to JavaScript was no longer realistic.

At that stage, the only viable path forward was to **finish the Go rewrite and make it run on Cloudflare Workers via WebAssembly**.


### 2. Migrating to Cloudflare Workers with Go + WASM

Cloudflare Workers do not support native Go runtimes, so the backend had to be compiled to WebAssembly and executed inside the Workers runtime.

The final setup used:
- `wrangler` for deployment and environment management
- Go compiled to `js/wasm`
- `github.com/syumai/workers` to bridge Go’s HTTP model with the Workers runtime

```bash
GOGC=50 GOMEMLIMIT=10MiB GOOS=js GOARCH=wasm go build -o ./build/app.wasm ./cmd
```

### 3. Database Migration: MongoDB → D1 (SQLite)

MongoDB Atlas was replaced with Cloudflare D1 to reduce latency and simplify deployment.

The migration required:

* Flattening document-based models into relational tables
* Explicit normalization
* Rethinking query patterns that previously relied on flexible schemas

```sql
-- Threads table
CREATE TABLE threads (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);

-- Posts table
CREATE TABLE posts (
  id TEXT PRIMARY KEY,
  thread_id TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL,
  FOREIGN KEY (thread_id) REFERENCES threads(id)
);
```
While D1 is fast and globally distributed, it lacks several features expected from traditional databases, requiring careful query design and defensive application logic.


### 4. Performance and Cost Characteristics
| Metrics    | Cloudflare Workers | AWS EC2               |
| ---------- | ------------------ | --------------------- |
| Latency    | 50–1000ms global   | 50–150ms              |
| Cold Start | ~1000ms (WASM)     | 5–50ms                |
| Scaling    | Per-request        | Manual / Auto Scaling |


| Cost    | Cloudflare Workers       | AWS EC2 (t3.micro)   |
| ------- | ------------------------ | -------------------- |
| Pricing | $0.15 / million requests + 100k free requests/day | Fixed instance cost  |
| Scaling | Automatic                | Must provision ahead |
| Extras  | CDN, DDoS built-in       | ELB, NAT, monitoring |

Despite higher cold-start latency, Workers eliminate infrastructure management entirely and scale globally by default.

> In short, this migration was less about Workers being “faster” or “cheaper” in abstract terms, and more about choosing a platform whose execution model matched the direction the system had already taken.

### 5. Image Processing as a Separate Worker

Image processing was split into its own Worker to isolate memory-heavy workloads.

Key design decisions:

* WebAssembly-based image processing using sharp-wasm
* Stateless HTTP interface between workers
* On-demand resizing and format conversion
* Assets stored in Cloudflare R2

This separation prevented memory spikes in the main API worker.
* Separate Cloudflare Worker for image transformations uses img/sharp-wasm for WebAssembly-accelerated image processing
* Communicates via HTTP endpoints with the main application
* On-demand image resizing
* Format conversion


### 6. Major Challenges and How They Were Solved
One of the biggest conceptual shifts was `state management`. Workers are `stateless by default`, which meant all implicit in-memory assumptions had to be removed. Read-heavy data was moved into Cloudflare KV.

`File handling` required a similar rethink. Any filesystem-based logic was removed entirely. `Cloudflare R2` replaced disk storage, and planning `streaming APIs` to replace reads and writes to stay within memory limits.

For `authentication`, the system was redesigned around `JWT validation` inside Workers, with `Cloudflare Access` providing edge-level protection. This eliminated the need for traditional `session stores` or middleware-heavy authentication stacks.

Finally, `configuration management` was simplified by moving everything to `environment bindings` and `Wrangler secrets`. No configuration values are hardcoded, making deployments `reproducible` and safer by default.


### Pros of the Final Architecture

The most immediate benefit is `operational simplicity`. There are no servers to manage, no scaling rules to tune, and no regions to deploy manually. The platform `scales automatically`.

`Cost efficiency` is another major advantage. The system only incurs cost when requests are actually processed, making idle time effectively free a clear improvement over uptime-based pricing models.

From a `performance` perspective, requests terminate at the `nearest edge location`, with caching and CDN layers built in by default. The strict separation between `API logic`, `image processing`, and `storage` enforces strong isolation and keeps failures localized.

### Limitations and Trade-offs

1. WASM Constraints
    * Strict memory limits
    * No system calls or filesystem access
2. D1 Constraints
    * Limited transactional guarantees  
    * Fewer optimization primitives than mature RDBMSs
3. Cold Starts
    * WASM initialization adds noticeable latency
    * Requires architectural tolerance for spikes
4. Vendor Lock-in
    * Heavy reliance on Cloudflare-specific primitives
    * Portability requires significant refactoring


```go
import "github.com/syumai/workers/cloudflare/fetch"

func (s *resizeImageService) ResizeImage(ctx context.Context) error {
	// Fetch is a Cloudflare utility for making HTTP requests from Workers as we cannot use the standard library
	// Due to limitation of cloudflare workers, we cannot use the standard library

	cli := fetch.NewClient()
	req, err := fetch.NewRequest(ctx, http.MethodGet, s.externalURL, nil)
	if err != nil {
		return err
	}
	// Handle response...
	return nil
}
```


## Final Thoughts
This migration was not a planned optimization it was a forced architectural reckoning. What emerged is a backend that is cheaper, globally distributed, and operationally simpler, but also far more constrained and explicit in its design.

Cloudflare Workers are not a drop-in replacement for traditional servers. They require a mindset shift. Once embraced, however, they unlock an entirely different way of thinking about backend systems.