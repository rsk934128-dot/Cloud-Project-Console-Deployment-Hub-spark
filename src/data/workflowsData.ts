import { Workflow, WorkflowExecution, WorkflowTemplate } from '../types/workflows';

export const INITIAL_WORKFLOWS: Workflow[] = [
  {
    id: 'wf-checkout-orchestrator',
    name: 'ecommerce-checkout-orchestration',
    description: 'High-reliability distributed checkout pipeline: inventory reservation, Stripe 3DS charge, parallel PDF invoice compilation, warehouse sync & customer receipt.',
    status: 'active',
    trigger: {
      type: 'webhook',
      webhookPath: '/api/v1/workflows/triggers/checkout-intent',
    },
    concurrencyLimit: 250,
    timeoutSeconds: 300,
    createdAt: '2026-08-12T09:14:00Z',
    updatedAt: '2026-09-20T18:42:10Z',
    lastRunAt: '2 mins ago',
    lastRunStatus: 'succeeded',
    totalRuns: 184520,
    avgDurationMs: 462,
    successRate: 99.94,
    tags: ['e-commerce', 'payments', 'stripe', 'critical'],
    steps: [
      {
        id: 'step-validate-cart',
        name: 'validate_cart_and_inventory',
        description: 'Verify SKU stock allocations and price integrity against Redis cache in Ashburn.',
        actionType: 'db_query',
        config: {
          query: 'SELECT sku, quantity, reserved FROM inventory WHERE order_id = :order_id FOR UPDATE;'
        },
        timeoutSeconds: 15,
        maxRetries: 3,
        dependencies: []
      },
      {
        id: 'step-charge-stripe',
        name: 'charge_stripe_payment',
        description: 'Process idempotent credit card or Apple Pay capture via Stripe Connect gateway.',
        actionType: 'http_request',
        config: {
          endpoint: 'https://api.stripe.com/v1/payment_intents/:intent_id/confirm',
          method: 'POST',
          headers: { 'Authorization': 'Bearer sec_live_99x...', 'Idempotency-Key': 'wf_ord_#order_id' }
        },
        timeoutSeconds: 30,
        maxRetries: 2,
        dependencies: ['step-validate-cart']
      },
      {
        id: 'step-gen-pdf-invoice',
        name: 'generate_pdf_invoice',
        description: 'Spawn Firecracker microVM instance to render branded PDF invoice using headless Chromium.',
        actionType: 'microvm_exec',
        config: {
          runtime: 'nodejs22',
          script: 'const { renderPdf } = require("@cloudmesh/pdf"); await renderPdf(orderPayload);'
        },
        timeoutSeconds: 45,
        maxRetries: 2,
        dependencies: ['step-charge-stripe'],
        parallelWith: ['step-sync-warehouse']
      },
      {
        id: 'step-sync-warehouse',
        name: 'dispatch_warehouse_fulfillment',
        description: 'Post order manifest to ShipBob 3PL API for automated pick-and-pack routing.',
        actionType: 'http_request',
        config: {
          endpoint: 'https://api.shipbob.com/1.0/orders',
          method: 'POST'
        },
        timeoutSeconds: 20,
        maxRetries: 4,
        dependencies: ['step-charge-stripe'],
        parallelWith: ['step-gen-pdf-invoice']
      },
      {
        id: 'step-send-confirmation',
        name: 'send_confirmation_email',
        description: 'Dispatch transactional confirmation email with PDF receipt attachment via Resend.',
        actionType: 'email_dispatch',
        config: {
          recipient: 'customer.email',
          endpoint: 'https://api.resend.com/emails'
        },
        timeoutSeconds: 15,
        maxRetries: 3,
        dependencies: ['step-gen-pdf-invoice', 'step-sync-warehouse']
      }
    ]
  },
  {
    id: 'wf-rag-doc-indexer',
    name: 'continuous-rag-knowledge-indexer',
    description: 'Autonomous document ingestion pipeline: crawls changed docs, extracts clean markdown, calculates Gemini embedding vectors, and syncs Pinecone index.',
    status: 'active',
    trigger: {
      type: 'event',
      eventTopic: 'storage.bucket.document.uploaded',
    },
    concurrencyLimit: 50,
    timeoutSeconds: 600,
    createdAt: '2026-08-25T14:30:00Z',
    updatedAt: '2026-09-21T02:11:00Z',
    lastRunAt: '14 mins ago',
    lastRunStatus: 'succeeded',
    totalRuns: 42190,
    avgDurationMs: 1340,
    successRate: 99.81,
    tags: ['ai-gateway', 'embeddings', 'pinecone', 'gemini'],
    steps: [
      {
        id: 'step-fetch-doc',
        name: 'download_document_payload',
        description: 'Fetch object blob from Cloud Storage bucket and verify mime type & size limit.',
        actionType: 'http_request',
        config: {
          endpoint: 'https://storage.googleapis.com/knowledge-base-iad1/:object_key',
          method: 'GET'
        },
        timeoutSeconds: 30,
        maxRetries: 3,
        dependencies: []
      },
      {
        id: 'step-chunk-text',
        name: 'chunk_markdown_tokens',
        description: 'Execute token-aware sliding window chunker in Firecracker sandbox with 512 token spans.',
        actionType: 'microvm_exec',
        config: {
          runtime: 'python312',
          script: 'import tiktoken\nchunks = sliding_window_chunk(doc_text, window_size=512, overlap=64)'
        },
        timeoutSeconds: 60,
        maxRetries: 2,
        dependencies: ['step-fetch-doc']
      },
      {
        id: 'step-gen-embeddings',
        name: 'generate_gemini_embeddings',
        description: 'Call Gemini text-embedding-004 endpoint via AI Gateway with semantic caching.',
        actionType: 'ai_inference',
        config: {
          model: 'text-embedding-004',
          prompt: 'Batch generate 768-dim embeddings for all document chunks.'
        },
        timeoutSeconds: 45,
        maxRetries: 3,
        dependencies: ['step-chunk-text']
      },
      {
        id: 'step-upsert-vector-db',
        name: 'upsert_pinecone_vectors',
        description: 'Persist dense vector records with chunk metadata to pinecone-serverless-iad1.',
        actionType: 'http_request',
        config: {
          endpoint: 'https://kb-index-svc.pinecone.io/vectors/upsert',
          method: 'POST'
        },
        timeoutSeconds: 40,
        maxRetries: 3,
        dependencies: ['step-gen-embeddings']
      }
    ]
  },
  {
    id: 'wf-nightly-db-backup',
    name: 'nightly-database-vacuum-and-backup',
    description: 'Scheduled multi-region disaster recovery runbook: locks snapshot replica, performs pg_dump, encrypts via AES-GCM-256, streams to Cloudflare R2 & validates checksum.',
    status: 'active',
    trigger: {
      type: 'cron',
      cronExpression: '0 3 * * *',
      cronDescription: 'Every day at 03:00 UTC (11:00 PM EST)',
    },
    concurrencyLimit: 1,
    timeoutSeconds: 1800,
    createdAt: '2026-07-01T00:00:00Z',
    updatedAt: '2026-09-20T03:00:00Z',
    lastRunAt: '4 hours ago',
    lastRunStatus: 'succeeded',
    totalRuns: 365,
    avgDurationMs: 38400,
    successRate: 100.0,
    tags: ['cron', 'database', 'backup', 'security', 'compliance'],
    steps: [
      {
        id: 'step-db-lock-replica',
        name: 'create_read_replica_snapshot',
        description: 'Create point-in-time snapshot of Aurora PostgreSQL cluster without disrupting primary.',
        actionType: 'db_query',
        config: {
          query: 'SELECT pg_create_restore_point(\'nightly_backup_\' || to_char(now(), \'YYYYMMDD\'));'
        },
        timeoutSeconds: 60,
        maxRetries: 2,
        dependencies: []
      },
      {
        id: 'step-pg-dump-stream',
        name: 'execute_pg_dump_in_sandbox',
        description: 'Run hardened pg_dump utility inside isolated sandbox with zstandard compression level 19.',
        actionType: 'microvm_exec',
        config: {
          runtime: 'nodejs22',
          script: 'pg_dump -h $PG_HOST -U backup_user -F c -Z zstd:19 db_production > backup.zst'
        },
        timeoutSeconds: 600,
        maxRetries: 1,
        dependencies: ['step-db-lock-replica']
      },
      {
        id: 'step-encrypt-aes',
        name: 'encrypt_payload_aes256',
        description: 'Envelop encryption using Google Cloud KMS customer-managed key (iad1-kms-sec-key).',
        actionType: 'microvm_exec',
        config: {
          runtime: 'nodejs22',
          script: 'await kmsEncryptFile("backup.zst", "backup.zst.enc");'
        },
        timeoutSeconds: 120,
        maxRetries: 2,
        dependencies: ['step-pg-dump-stream']
      },
      {
        id: 'step-upload-r2',
        name: 'stream_to_r2_cold_storage',
        description: 'Upload encrypted tarball to multi-region Cloudflare R2 bucket with 90-day lifecycle retention.',
        actionType: 'http_request',
        config: {
          endpoint: 'https://r2.cloudflarestorage.com/prod-backups-archive/db_nightly.enc',
          method: 'PUT'
        },
        timeoutSeconds: 300,
        maxRetries: 3,
        dependencies: ['step-encrypt-aes']
      },
      {
        id: 'step-verify-sha',
        name: 'verify_remote_sha256_checksum',
        description: 'Download ETag header and compute SHA256 integrity match before releasing lock.',
        actionType: 'microvm_exec',
        config: {
          runtime: 'nodejs22',
          script: 'const match = await verifyRemoteHash(remoteUrl, localSha256); assert(match);'
        },
        timeoutSeconds: 60,
        maxRetries: 2,
        dependencies: ['step-upload-r2']
      }
    ]
  },
  {
    id: 'wf-incident-auto-heal',
    name: 'incident-auto-remediation-runbook',
    description: 'Triggered upon edge latency spikes or container health check drops. Automatically drains malfunctioning edge nodes, reboots microVM pods, clears CDN cache, and sends status alerts.',
    status: 'active',
    trigger: {
      type: 'webhook',
      webhookPath: '/api/v1/workflows/triggers/incident-alert',
    },
    concurrencyLimit: 5,
    timeoutSeconds: 300,
    createdAt: '2026-09-02T11:00:00Z',
    updatedAt: '2026-09-21T01:15:00Z',
    lastRunAt: '1 hour ago',
    lastRunStatus: 'succeeded',
    totalRuns: 89,
    avgDurationMs: 4210,
    successRate: 98.87,
    tags: ['ops-agent', 'self-healing', 'devops', 'alerts'],
    steps: [
      {
        id: 'step-parse-incident',
        name: 'analyze_incident_telemetry',
        description: 'Inspect OpenTelemetry span traces and pinpoint offending region and error rate.',
        actionType: 'transform',
        config: {
          transformFn: '(payload) => ({ targetRegion: payload.region, failureRate: payload.p99Latency > 400 })'
        },
        timeoutSeconds: 15,
        maxRetries: 2,
        dependencies: []
      },
      {
        id: 'step-drain-edge',
        name: 'drain_and_reroute_edge_node',
        description: 'Update Cloudflare WAF route to temporarily bypass degraded edge pop (sfo1).',
        actionType: 'http_request',
        config: {
          endpoint: 'https://api.cloudflare.com/client/v4/zones/:zone/origin_rules',
          method: 'PUT'
        },
        timeoutSeconds: 30,
        maxRetries: 3,
        dependencies: ['step-parse-incident']
      },
      {
        id: 'step-recycle-microvm',
        name: 'recycle_firecracker_sandbox_pool',
        description: 'Send graceful SIGTERM to stalled worker sandboxes and spawn warm standby instances.',
        actionType: 'microvm_exec',
        config: {
          runtime: 'nodejs22',
          script: 'await sandboxManager.recycleDegradedInstances({ region: payload.targetRegion });'
        },
        timeoutSeconds: 60,
        maxRetries: 2,
        dependencies: ['step-drain-edge']
      },
      {
        id: 'step-purge-cdn-cache',
        name: 'purge_regional_edge_cache',
        description: 'Issue instant tag-based cache invalidation across 280+ global PoP locations.',
        actionType: 'http_request',
        config: {
          endpoint: 'https://api.cloudmesh.edge/v1/cdn/purge',
          method: 'POST'
        },
        timeoutSeconds: 20,
        maxRetries: 3,
        dependencies: ['step-recycle-microvm']
      },
      {
        id: 'step-dispatch-ops-alert',
        name: 'dispatch_gmail_and_slack_summary',
        description: 'Send structured incident post-mortem with automated recovery timestamps to ops team.',
        actionType: 'email_dispatch',
        config: {
          recipient: 'rasadsk007@gmail.com',
          endpoint: 'https://gmail.googleapis.com/gmail/v1/users/me/messages/send'
        },
        timeoutSeconds: 15,
        maxRetries: 3,
        dependencies: ['step-purge-cdn-cache']
      }
    ]
  },
  {
    id: 'wf-user-onboarding-drip',
    name: 'user-onboarding-drip-orchestrator',
    description: 'Long-running multi-day stateful onboarding sequence with durable timers, sandbox provisioning, and automated milestone verification.',
    status: 'paused',
    trigger: {
      type: 'event',
      eventTopic: 'auth.user.signup.completed',
    },
    concurrencyLimit: 500,
    timeoutSeconds: 604800, // 7 days durable workflow
    createdAt: '2026-08-10T12:00:00Z',
    updatedAt: '2026-09-18T16:00:00Z',
    lastRunAt: '2 days ago',
    lastRunStatus: 'succeeded',
    totalRuns: 3410,
    avgDurationMs: 18200,
    successRate: 99.1,
    tags: ['onboarding', 'drip', 'durable-execution', 'timer'],
    steps: [
      {
        id: 'step-provision-default-sandbox',
        name: 'provision_dev_sandbox_environment',
        description: 'Allocate isolated 2 vCPU microVM container with starter Next.js 15 template.',
        actionType: 'microvm_exec',
        config: {
          runtime: 'nodejs22',
          script: 'await sandboxPool.provisionStarter({ userId: user.id, template: "nextjs15" });'
        },
        timeoutSeconds: 45,
        maxRetries: 2,
        dependencies: []
      },
      {
        id: 'step-send-welcome-pack',
        name: 'send_welcome_developer_pack',
        description: 'Dispatch API tokens, documentation links, and sandbox web terminal access url.',
        actionType: 'email_dispatch',
        config: {
          recipient: 'user.email'
        },
        timeoutSeconds: 20,
        maxRetries: 3,
        dependencies: ['step-provision-default-sandbox']
      },
      {
        id: 'step-wait-48-hours',
        name: 'durable_sleep_48h',
        description: 'State machine hibernates for 48 hours waiting for user first deployment milestone.',
        actionType: 'delay_wait',
        config: {
          delaySeconds: 172800 // 48h
        },
        timeoutSeconds: 200000,
        maxRetries: 1,
        dependencies: ['step-send-welcome-pack']
      },
      {
        id: 'step-check-deployment-milestone',
        name: 'verify_first_production_deployment',
        description: 'Query database to check if user has created at least 1 production deployment.',
        actionType: 'db_query',
        config: {
          query: 'SELECT COUNT(*) as deploy_count FROM deployments WHERE user_id = :user_id AND env = \'production\';'
        },
        timeoutSeconds: 15,
        maxRetries: 2,
        dependencies: ['step-wait-48-hours']
      }
    ]
  }
];

export const INITIAL_EXECUTIONS: WorkflowExecution[] = [
  {
    id: 'run-98420-a',
    workflowId: 'wf-checkout-orchestrator',
    workflowName: 'ecommerce-checkout-orchestration',
    status: 'succeeded',
    triggerType: 'webhook',
    triggeredBy: 'POST /checkout-intent (req_89f0293)',
    startedAt: '2026-09-21T10:08:12Z',
    completedAt: '2026-09-21T10:08:12.441Z',
    durationMs: 441,
    inputPayload: {
      orderId: 'ord_live_89104',
      userId: 'usr_premium_772',
      amount: 14900,
      currency: 'usd',
      cartItems: [
        { sku: 'CLOUDMESH-NODE-16', qty: 2, price: 5900 },
        { sku: 'EDGE-SECURITY-PACK', qty: 1, price: 3100 }
      ],
      paymentToken: 'tok_visa_4242'
    },
    outputPayload: {
      orderStatus: 'confirmed',
      paymentIntentId: 'pi_3P00294827',
      invoicePdfUrl: 'https://assets.cloudmesh.dev/invoices/inv_89104.pdf',
      shipmentTrackingId: 'SHIPBOB-TRACK-994103',
      receiptEmailDispatched: true
    },
    stepResults: [
      {
        stepId: 'step-validate-cart',
        stepName: 'validate_cart_and_inventory',
        actionType: 'db_query',
        status: 'succeeded',
        startedAt: '10:08:12.000',
        durationMs: 38,
        attempt: 1,
        inputPayload: { orderId: 'ord_live_89104' },
        outputPayload: { allocatedSkuCount: 2, reserved: true, lockReleased: true },
        logs: [
          '[INFO] Connection acquired from pool (iad1-pg-pool-01, 1.2ms)',
          '[INFO] SELECT sku, quantity, reserved FROM inventory WHERE order_id = "ord_live_89104" FOR UPDATE',
          '[INFO] Both SKUs in stock. Inventory held with 600s TTL.'
        ]
      },
      {
        stepId: 'step-charge-stripe',
        stepName: 'charge_stripe_payment',
        actionType: 'http_request',
        status: 'succeeded',
        startedAt: '10:08:12.040',
        durationMs: 194,
        attempt: 1,
        inputPayload: { amount: 14900, currency: 'usd', token: 'tok_visa_4242' },
        outputPayload: { chargeId: 'ch_3P0029', status: 'succeeded', feeCents: 462 },
        logs: [
          '[POST] https://api.stripe.com/v1/payment_intents (Idempotency-Key: wf_ord_ord_live_89104)',
          '[HTTP 200 OK] Response size: 1.8KB, Latency: 194ms',
          '[INFO] 3DS exemption granted by card issuer (low-risk score: 0.02)'
        ]
      },
      {
        stepId: 'step-gen-pdf-invoice',
        stepName: 'generate_pdf_invoice',
        actionType: 'microvm_exec',
        status: 'succeeded',
        startedAt: '10:08:12.235',
        durationMs: 98,
        attempt: 1,
        outputPayload: { pdfBytes: 248190, s3Key: 'invoices/inv_89104.pdf' },
        logs: [
          '[MICROVM] Acquired warm nodejs22 microVM (sbx-iad1-warm-48)',
          '[EXEC] Headless Chromium invoked with order data template',
          '[INFO] PDF rendered (2 pages, 248KB). Uploaded to storage CDN in 22ms.'
        ]
      },
      {
        stepId: 'step-sync-warehouse',
        stepName: 'dispatch_warehouse_fulfillment',
        actionType: 'http_request',
        status: 'succeeded',
        startedAt: '10:08:12.235',
        durationMs: 122,
        attempt: 1,
        outputPayload: { shipbobOrderId: 'SB-882940', fulfillmentCenter: 'Bethlehem, PA' },
        logs: [
          '[POST] https://api.shipbob.com/1.0/orders (payload 1.1KB)',
          '[HTTP 201 Created] Order registered with ShipBob fulfillment network',
          '[INFO] Assigned to nearest fulfillment center: Bethlehem-PA (US-EAST)'
        ]
      },
      {
        stepId: 'step-send-confirmation',
        stepName: 'send_confirmation_email',
        actionType: 'email_dispatch',
        status: 'succeeded',
        startedAt: '10:08:12.360',
        durationMs: 78,
        attempt: 1,
        outputPayload: { emailMessageId: 'resend_msg_01JB394', delivered: true },
        logs: [
          '[EMAIL] Dispatching to customer: rasadsk007@gmail.com',
          '[INFO] Attached generated PDF invoice (inv_89104.pdf)',
          '[HTTP 200] Email handed off to SMTP cluster with TLS 1.3.'
        ]
      }
    ]
  },
  {
    id: 'run-98419-b',
    workflowId: 'wf-rag-doc-indexer',
    workflowName: 'continuous-rag-knowledge-indexer',
    status: 'succeeded',
    triggerType: 'event',
    triggeredBy: 'storage.bucket.document.uploaded (api_spec_v3.md)',
    startedAt: '2026-09-21T09:54:02Z',
    completedAt: '2026-09-21T09:54:03.284Z',
    durationMs: 1284,
    inputPayload: {
      bucket: 'knowledge-base-iad1',
      objectKey: 'developer-guides/api_spec_v3.md',
      sizeBytes: 89400,
      contentType: 'text/markdown'
    },
    outputPayload: {
      chunksCount: 24,
      embeddingsGenerated: 24,
      vectorDimension: 768,
      pineconeUpsertDurationMs: 142
    },
    stepResults: [
      {
        stepId: 'step-fetch-doc',
        stepName: 'download_document_payload',
        actionType: 'http_request',
        status: 'succeeded',
        startedAt: '09:54:02.000',
        durationMs: 92,
        attempt: 1,
        logs: ['[GET] Cloud Storage bucket stream opened', '[INFO] 89.4 KB markdown payload cached in memory']
      },
      {
        stepId: 'step-chunk-text',
        stepName: 'chunk_markdown_tokens',
        actionType: 'microvm_exec',
        status: 'succeeded',
        startedAt: '09:54:02.095',
        durationMs: 118,
        attempt: 1,
        logs: ['[SANDBOX] Python 3.12 tiktoken running cl100k_base tokenizer', '[INFO] Emitted 24 semantic chunks with headers preserved']
      },
      {
        stepId: 'step-gen-embeddings',
        stepName: 'generate_gemini_embeddings',
        actionType: 'ai_inference',
        status: 'succeeded',
        startedAt: '09:54:02.215',
        durationMs: 910,
        attempt: 1,
        logs: ['[AI GATEWAY] Routing batch request to model text-embedding-004', '[INFO] 24 embeddings generated. Token count: 11,840.']
      },
      {
        stepId: 'step-upsert-vector-db',
        stepName: 'upsert_pinecone_vectors',
        actionType: 'http_request',
        status: 'succeeded',
        startedAt: '09:54:03.130',
        durationMs: 154,
        attempt: 1,
        logs: ['[POST] Upserting 24 vector records into namespace "v3-docs"', '[INFO] Pinecone index write acknowledged.']
      }
    ]
  },
  {
    id: 'run-98418-c',
    workflowId: 'wf-incident-auto-heal',
    workflowName: 'incident-auto-remediation-runbook',
    status: 'succeeded',
    triggerType: 'webhook',
    triggeredBy: 'Datadog Webhook Alert (Latency Spike > 500ms)',
    startedAt: '2026-09-21T09:05:40Z',
    completedAt: '2026-09-21T09:05:44.380Z',
    durationMs: 4380,
    inputPayload: {
      alertId: 'dd_alert_p99_spike',
      region: 'sfo1 (San Francisco)',
      p99Latency: 582,
      affectedMicroVMs: ['sbx-sfo1-node-99', 'sbx-sfo1-node-104']
    },
    outputPayload: {
      actionTaken: 'Rerouted sfo1 traffic to lax1; recycled 2 stalled microVMs; purged edge cache',
      recoveryTimeSec: 4.38,
      currentP99Latency: 28
    },
    stepResults: [
      {
        stepId: 'step-parse-incident',
        stepName: 'analyze_incident_telemetry',
        actionType: 'transform',
        status: 'succeeded',
        startedAt: '09:05:40.000',
        durationMs: 12,
        attempt: 1,
        logs: ['[INFO] Parsing alert payload from Datadog monitor #89104', '[INFO] Offending PoP isolated: SFO1']
      },
      {
        stepId: 'step-drain-edge',
        stepName: 'drain_and_reroute_edge_node',
        actionType: 'http_request',
        status: 'succeeded',
        startedAt: '09:05:40.015',
        durationMs: 340,
        attempt: 1,
        logs: ['[PUT] Updating Edge routing table to weighted bypass', '[INFO] 100% of West Coast traffic rerouted to Los Angeles (lax1)']
      },
      {
        stepId: 'step-recycle-microvm',
        stepName: 'recycle_firecracker_sandbox_pool',
        actionType: 'microvm_exec',
        status: 'succeeded',
        startedAt: '09:05:40.360',
        durationMs: 2410,
        attempt: 1,
        logs: ['[MICROVM] Sent SIGTERM to stalled pods', '[INFO] 2 fresh Firecracker microVM instances booted in 118ms and passed health check']
      },
      {
        stepId: 'step-purge-cdn-cache',
        stepName: 'purge_regional_edge_cache',
        actionType: 'http_request',
        status: 'succeeded',
        startedAt: '09:05:42.775',
        durationMs: 480,
        attempt: 1,
        logs: ['[PURGE] Regional cache invalidated for /api/v1/live/*', '[INFO] Cache purge propagated across 280 edge nodes in 480ms']
      },
      {
        stepId: 'step-dispatch-ops-alert',
        stepName: 'dispatch_gmail_and_slack_summary',
        actionType: 'email_dispatch',
        status: 'succeeded',
        startedAt: '09:05:43.260',
        durationMs: 1120,
        attempt: 1,
        logs: ['[DISPATCH] Sent high-priority Gmail notification to rasadsk007@gmail.com', '[SLACK] Incident resolution posted to #ops-war-room']
      }
    ]
  },
  {
    id: 'run-98417-d',
    workflowId: 'wf-nightly-db-backup',
    workflowName: 'nightly-database-vacuum-and-backup',
    status: 'succeeded',
    triggerType: 'cron',
    triggeredBy: 'Cron Schedule (0 3 * * *)',
    startedAt: '2026-09-21T03:00:00Z',
    completedAt: '2026-09-21T03:00:39.120Z',
    durationMs: 39120,
    inputPayload: {
      clusterId: 'aurora-pg-cluster-iad1',
      database: 'cloudmesh_production',
      backupType: 'full_zstd_encrypted'
    },
    outputPayload: {
      tarballSizeGb: 4.82,
      sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      destinationR2Url: 'https://r2.cloudflarestorage.com/prod-backups-archive/db_20260921.enc',
      checksumVerified: true
    },
    stepResults: [
      {
        stepId: 'step-db-lock-replica',
        stepName: 'create_read_replica_snapshot',
        actionType: 'db_query',
        status: 'succeeded',
        startedAt: '03:00:00.000',
        durationMs: 1200,
        attempt: 1,
        logs: ['[AURORA] Snapshot point established: nightly_backup_20260921']
      },
      {
        stepId: 'step-pg-dump-stream',
        stepName: 'execute_pg_dump_in_sandbox',
        actionType: 'microvm_exec',
        status: 'succeeded',
        startedAt: '03:00:01.200',
        durationMs: 24500,
        attempt: 1,
        logs: ['[PG_DUMP] Dumping 18.4GB raw tables with zstd level 19 compression', '[INFO] Compressed to 4.82 GB in 24.5s']
      },
      {
        stepId: 'step-encrypt-aes',
        stepName: 'encrypt_payload_aes256',
        actionType: 'microvm_exec',
        status: 'succeeded',
        startedAt: '03:00:25.700',
        durationMs: 4200,
        attempt: 1,
        logs: ['[KMS] AES-GCM-256 envelope encryption completed with key iad1-kms-sec-key']
      },
      {
        stepId: 'step-upload-r2',
        stepName: 'stream_to_r2_cold_storage',
        actionType: 'http_request',
        status: 'succeeded',
        startedAt: '03:00:29.900',
        durationMs: 8200,
        attempt: 1,
        logs: ['[R2] Multi-part stream upload finished (100MB chunk size, 1.2 Gbps)']
      },
      {
        stepId: 'step-verify-sha',
        stepName: 'verify_remote_sha256_checksum',
        actionType: 'microvm_exec',
        status: 'succeeded',
        startedAt: '03:00:38.100',
        durationMs: 1020,
        attempt: 1,
        logs: ['[SHA256] Remote and local digests match. Backup certified for SOC-2 Type II audit.']
      }
    ]
  }
];

export const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  {
    id: 'tmpl-ai-rag',
    title: 'AI Batch RAG & Vector Embeddings',
    category: 'ai_pipeline',
    description: 'Listen to document uploads, run smart markdown chunking inside a Firecracker sandbox, calculate Gemini vector embeddings, and bulk-upsert into Pinecone.',
    icon: 'Cpu',
    triggerType: 'event',
    stepCount: 4,
    estimatedLatency: '~1.2s per doc',
    tags: ['Gemini', 'Vector DB', 'RAG', 'Serverless'],
    workflowDef: {
      name: 'ai-document-rag-embedder',
      description: 'Automated document ingestion, chunking, and Gemini embedding pipeline.',
      trigger: {
        type: 'event',
        eventTopic: 'documents.new_upload'
      },
      steps: [
        {
          id: 'step-1',
          name: 'download_doc_stream',
          description: 'Fetch file from S3 / R2 storage bucket',
          actionType: 'http_request',
          config: { method: 'GET' },
          timeoutSeconds: 30,
          maxRetries: 2,
          dependencies: []
        },
        {
          id: 'step-2',
          name: 'tokenize_and_chunk',
          description: 'Extract clean markdown and build 512 token chunks in sandbox',
          actionType: 'microvm_exec',
          config: { runtime: 'python312' },
          timeoutSeconds: 60,
          maxRetries: 2,
          dependencies: ['step-1']
        },
        {
          id: 'step-3',
          name: 'gemini_embedding_batch',
          description: 'Calculate 768-dim embeddings using Gemini text-embedding-004',
          actionType: 'ai_inference',
          config: { model: 'text-embedding-004' },
          timeoutSeconds: 45,
          maxRetries: 3,
          dependencies: ['step-2']
        },
        {
          id: 'step-4',
          name: 'pinecone_upsert',
          description: 'Persist dense vectors to Pinecone index namespace',
          actionType: 'http_request',
          config: { method: 'POST' },
          timeoutSeconds: 30,
          maxRetries: 3,
          dependencies: ['step-3']
        }
      ],
      tags: ['ai', 'rag', 'gemini', 'pinecone']
    }
  },
  {
    id: 'tmpl-checkout-stripe',
    title: 'Distributed E-Commerce Checkout',
    category: 'ecommerce',
    description: 'Guaranteed-once payment fulfillment flow: reserve inventory, charge Stripe card token, compile PDF receipt in parallel with warehouse sync, and send email.',
    icon: 'ShoppingCart',
    triggerType: 'webhook',
    stepCount: 5,
    estimatedLatency: '~450ms',
    tags: ['Payments', 'Stripe', 'Idempotent', 'Email'],
    workflowDef: {
      name: 'stripe-checkout-orchestration',
      description: 'Distributed payment, PDF generation, and fulfillment pipeline.',
      trigger: {
        type: 'webhook',
        webhookPath: '/api/v1/workflows/checkout'
      },
      steps: [
        {
          id: 'step-1',
          name: 'reserve_inventory_lock',
          description: 'Verify and lock SKU inventory in PostgreSQL',
          actionType: 'db_query',
          config: {},
          timeoutSeconds: 15,
          maxRetries: 3,
          dependencies: []
        },
        {
          id: 'step-2',
          name: 'stripe_payment_capture',
          description: 'Capture payment via Stripe API with idempotency token',
          actionType: 'http_request',
          config: { method: 'POST' },
          timeoutSeconds: 30,
          maxRetries: 2,
          dependencies: ['step-1']
        },
        {
          id: 'step-3a',
          name: 'render_pdf_receipt',
          description: 'Generate PDF receipt in microVM',
          actionType: 'microvm_exec',
          config: { runtime: 'nodejs22' },
          timeoutSeconds: 30,
          maxRetries: 2,
          dependencies: ['step-2']
        },
        {
          id: 'step-3b',
          name: 'dispatch_fulfillment',
          description: 'Send pick request to 3PL API',
          actionType: 'http_request',
          config: { method: 'POST' },
          timeoutSeconds: 20,
          maxRetries: 3,
          dependencies: ['step-2']
        },
        {
          id: 'step-4',
          name: 'send_order_email',
          description: 'Deliver receipt with attachment to customer',
          actionType: 'email_dispatch',
          config: {},
          timeoutSeconds: 15,
          maxRetries: 3,
          dependencies: ['step-3a', 'step-3b']
        }
      ],
      tags: ['ecommerce', 'stripe', 'billing']
    }
  },
  {
    id: 'tmpl-db-nightly',
    title: 'Nightly Database Backup & Cloudflare R2 Sync',
    category: 'database',
    description: 'Scheduled cron pipeline to snapshot Aurora / Postgres databases, zstd-compress, envelope-encrypt via KMS, stream to cold storage, and audit checksum.',
    icon: 'HardDrive',
    triggerType: 'cron',
    stepCount: 5,
    estimatedLatency: '~35s',
    tags: ['Cron', 'PostgreSQL', 'KMS', 'Disaster Recovery'],
    workflowDef: {
      name: 'nightly-db-backup-r2',
      description: 'Daily automated database backup, encryption, and S3/R2 retention sync.',
      trigger: {
        type: 'cron',
        cronExpression: '0 3 * * *',
        cronDescription: 'Every day at 03:00 UTC'
      },
      steps: [
        {
          id: 'step-1',
          name: 'create_replica_snapshot',
          description: 'Lock point-in-time snapshot on read-replica',
          actionType: 'db_query',
          config: {},
          timeoutSeconds: 30,
          maxRetries: 2,
          dependencies: []
        },
        {
          id: 'step-2',
          name: 'execute_pg_dump',
          description: 'Stream pg_dump with zstandard compression',
          actionType: 'microvm_exec',
          config: { runtime: 'nodejs22' },
          timeoutSeconds: 600,
          maxRetries: 1,
          dependencies: ['step-1']
        },
        {
          id: 'step-3',
          name: 'kms_aes256_encrypt',
          description: 'Encrypt archive with KMS hardware key',
          actionType: 'microvm_exec',
          config: {},
          timeoutSeconds: 120,
          maxRetries: 2,
          dependencies: ['step-2']
        },
        {
          id: 'step-4',
          name: 'upload_to_cold_storage',
          description: 'Stream encrypted tarball to Cloudflare R2 bucket',
          actionType: 'http_request',
          config: { method: 'PUT' },
          timeoutSeconds: 300,
          maxRetries: 3,
          dependencies: ['step-3']
        },
        {
          id: 'step-5',
          name: 'verify_sha256_hash',
          description: 'Certify remote archive integrity matches local SHA256',
          actionType: 'microvm_exec',
          config: {},
          timeoutSeconds: 60,
          maxRetries: 2,
          dependencies: ['step-4']
        }
      ],
      tags: ['cron', 'database', 'backup', 'security']
    }
  },
  {
    id: 'tmpl-incident-self-heal',
    title: 'Autonomous Ops Self-Healing Runbook',
    category: 'devops',
    description: 'Automatic anomaly responder: triggered by edge latency spikes or error thresholds. Dynamically diverts DNS traffic, reboots microVM pods, flushes CDN, and notifies team.',
    icon: 'ShieldCheck',
    triggerType: 'webhook',
    stepCount: 5,
    estimatedLatency: '~4.2s',
    tags: ['Self-Healing', 'Ops', 'WAF', 'PagerDuty'],
    workflowDef: {
      name: 'edge-incident-self-healer',
      description: 'Autonomous incident mitigation and traffic failover runbook.',
      trigger: {
        type: 'webhook',
        webhookPath: '/api/v1/workflows/incident-alert'
      },
      steps: [
        {
          id: 'step-1',
          name: 'parse_telemetry_trace',
          description: 'Isolate failing edge node and error signature',
          actionType: 'transform',
          config: {},
          timeoutSeconds: 15,
          maxRetries: 2,
          dependencies: []
        },
        {
          id: 'step-2',
          name: 'reroute_edge_node',
          description: 'Update Cloudflare WAF route to bypass degraded PoP',
          actionType: 'http_request',
          config: { method: 'PUT' },
          timeoutSeconds: 30,
          maxRetries: 3,
          dependencies: ['step-1']
        },
        {
          id: 'step-3',
          name: 'recycle_microvm_pool',
          description: 'Restart worker sandboxes and spawn warm standby',
          actionType: 'microvm_exec',
          config: { runtime: 'nodejs22' },
          timeoutSeconds: 60,
          maxRetries: 2,
          dependencies: ['step-2']
        },
        {
          id: 'step-4',
          name: 'purge_regional_cache',
          description: 'Invalidate stale edge cache across 280+ locations',
          actionType: 'http_request',
          config: { method: 'POST' },
          timeoutSeconds: 20,
          maxRetries: 3,
          dependencies: ['step-3']
        },
        {
          id: 'step-5',
          name: 'notify_ops_channels',
          description: 'Send high-priority Gmail & Slack mitigation summary',
          actionType: 'email_dispatch',
          config: {},
          timeoutSeconds: 15,
          maxRetries: 3,
          dependencies: ['step-4']
        }
      ],
      tags: ['ops', 'incident', 'self-healing']
    }
  }
];
