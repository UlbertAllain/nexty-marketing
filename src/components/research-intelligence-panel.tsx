"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clipboard,
  ExternalLink,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import type { Lead } from "@/modules/leads/types";
import { useAuth } from "@/modules/auth/auth-context";
import {
  requestLeadResearch,
  subscribeResearchAnalysis,
} from "@/modules/intelligence/intelligence.client";
import type { ResearchAnalysis } from "@/modules/intelligence/types";
import { buildWhatsAppUrl } from "@/lib/utils/phone";

export function ResearchIntelligencePanel({ lead }: { lead: Lead }) {
  const { user } = useAuth();
  const [analysis, setAnalysis] = useState<ResearchAnalysis | null>(null);
  const [running, setRunning] = useState(false);
  const [loadingSaved, setLoadingSaved] = useState(
    Boolean(lead.latestResearchAnalysisId),
  );
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!lead.latestResearchAnalysisId) {
      setAnalysis(null);
      setLoadingSaved(false);
      return;
    }

    setLoadingSaved(true);
    return subscribeResearchAnalysis(
      lead.latestResearchAnalysisId,
      (nextAnalysis) => {
        setAnalysis(nextAnalysis);
        setLoadingSaved(false);
      },
    );
  }, [lead.latestResearchAnalysisId]);

  const whatsappUrl = useMemo(
    () =>
      analysis
        ? buildWhatsAppUrl(lead.phone, analysis.outreach.draftMessage)
        : "",
    [analysis, lead.phone],
  );

  async function runResearch() {
    if (!user || running) return;

    setRunning(true);
    setError("");

    try {
      const idToken = await user.getIdToken();
      const nextAnalysis = await requestLeadResearch(lead.id, idToken);
      setAnalysis(nextAnalysis);
    } catch (researchError) {
      setError(
        researchError instanceof Error
          ? researchError.message
          : "Riset AI gagal diproses.",
      );
    } finally {
      setRunning(false);
    }
  }

  async function copyDraft() {
    if (!analysis?.outreach.draftMessage) return;
    await navigator.clipboard.writeText(analysis.outreach.draftMessage);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <section className="panel ai-research-panel">
      <div className="panel-heading ai-research-heading">
        <div>
          <p className="eyebrow">AI Research Intelligence</p>
          <h2>Riset bisnis berbasis sumber publik</h2>
          <p className="panel-description">
            AI mencari bukti publik, memetakan gap, lalu sistem mencocokkannya
            dengan layanan NextyLabs dan menghitung prioritas secara terukur.
          </p>
        </div>
        <button
          className="button ai-research-button"
          onClick={runResearch}
          disabled={running || !user}
        >
          {running ? <RefreshCw className="spin" size={16} /> : <Sparkles size={16} />}
          {running
            ? "Sedang meriset…"
            : analysis
              ? "Riset ulang"
              : "Riset dengan AI"}
        </button>
      </div>

      {error ? (
        <div className="ai-research-error">
          <AlertTriangle size={16} />
          <span>{error}</span>
        </div>
      ) : null}

      {running ? (
        <div className="ai-research-loading">
          <div className="ai-research-loading-icon">
            <Sparkles size={18} />
          </div>
          <div>
            <strong>AI sedang mencari dan memverifikasi sumber publik.</strong>
            <p>
              Website, jejak digital, gap bisnis, kecocokan layanan, dan strategi
              pendekatan sedang dianalisis.
            </p>
          </div>
        </div>
      ) : null}

      {!running && loadingSaved ? (
        <div className="ai-research-empty">Memuat hasil riset terakhir…</div>
      ) : null}

      {!running && !loadingSaved && !analysis ? (
        <div className="ai-research-empty">
          <Sparkles size={20} />
          <div>
            <strong>Belum ada riset AI untuk calon klien ini.</strong>
            <p>
              Jalankan riset untuk mendapatkan temuan berbasis evidence,
              rekomendasi layanan, skor prioritas, dan draft pendekatan.
            </p>
          </div>
        </div>
      ) : null}

      {!running && analysis ? (
        <ResearchResult
          analysis={analysis}
          copied={copied}
          whatsappUrl={whatsappUrl}
          onCopy={copyDraft}
        />
      ) : null}
    </section>
  );
}

function ResearchResult({
  analysis,
  copied,
  whatsappUrl,
  onCopy,
}: {
  analysis: ResearchAnalysis;
  copied: boolean;
  whatsappUrl: string;
  onCopy: () => void;
}) {
  const researchedAt = new Date(analysis.researchedAt).toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <div className="ai-research-result">
      <div className="ai-research-overview">
        <div className="ai-opportunity-score">
          <span>Opportunity Score</span>
          <div>
            <strong>{analysis.scoring.opportunityScore}</strong>
            <small>/100</small>
          </div>
          <p>Prioritas internal, bukan probabilitas closing.</p>
        </div>

        <div className="ai-research-summary">
          <span>Ringkasan</span>
          <p>{analysis.summary}</p>
          <small>
            {analysis.model || "Model tidak dicatat"} · {researchedAt}
          </small>
        </div>
      </div>

      <div className="ai-score-grid">
        <ScoreItem label="Celah digital" value={analysis.scoring.digitalGap} />
        <ScoreItem label="Kebutuhan bisnis" value={analysis.scoring.businessNeed} />
        <ScoreItem label="Kecocokan layanan" value={analysis.scoring.serviceFit} />
        <ScoreItem label="Nilai proyek" value={analysis.scoring.ticketPotential} />
        <ScoreItem label="Kemudahan kontak" value={analysis.scoring.contactability} />
        <ScoreItem label="Kualitas evidence" value={analysis.scoring.evidenceQuality} />
      </div>

      <div className="ai-insight-grid">
        <section className="ai-insight-card">
          <div className="ai-insight-title">
            <AlertTriangle size={16} />
            <div>
              <strong>Gap terdeteksi</strong>
              <span>{analysis.gaps.length} temuan berbasis sumber</span>
            </div>
          </div>
          <div className="ai-item-list">
            {analysis.gaps.slice(0, 5).map((gap) => (
              <div key={gap.id} className="ai-list-item">
                <strong>{gap.title}</strong>
                <p>{gap.description}</p>
                <small>{gap.impact}</small>
              </div>
            ))}
            {!analysis.gaps.length ? (
              <p className="muted small">
                Tidak ada gap kuat yang berhasil diverifikasi.
              </p>
            ) : null}
          </div>
        </section>

        <section className="ai-insight-card">
          <div className="ai-insight-title">
            <CheckCircle2 size={16} />
            <div>
              <strong>Rekomendasi NextyLabs</strong>
              <span>Maksimal tiga layanan paling relevan</span>
            </div>
          </div>
          <div className="ai-item-list">
            {analysis.recommendedOffers.map((offer, index) => (
              <div key={offer.serviceId} className="ai-offer-item">
                <span>{index + 1}</span>
                <div>
                  <strong>{offer.serviceName}</strong>
                  <p>{offer.reason}</p>
                </div>
                <b>{offer.fitScore}</b>
              </div>
            ))}
            {!analysis.recommendedOffers.length ? (
              <p className="muted small">
                Belum ada layanan yang memiliki evidence cukup kuat untuk direkomendasikan.
              </p>
            ) : null}
          </div>
        </section>
      </div>

      <div className="ai-outreach-grid">
        <section className="ai-insight-card">
          <div className="ai-insight-title">
            <Sparkles size={16} />
            <div>
              <strong>Strategi pendekatan</strong>
              <span>Gunakan sebagai panduan, bukan script wajib.</span>
            </div>
          </div>
          <dl className="ai-strategy-list">
            <div>
              <dt>Target</dt>
              <dd>{analysis.outreach.targetRole}</dd>
            </div>
            <div>
              <dt>Angle</dt>
              <dd>{analysis.outreach.angle}</dd>
            </div>
            <div>
              <dt>Pembuka</dt>
              <dd>{analysis.outreach.openingStrategy}</dd>
            </div>
          </dl>
          {analysis.outreach.avoid.length ? (
            <div className="ai-avoid-box">
              <strong>Hindari</strong>
              <p>{analysis.outreach.avoid.join(" · ")}</p>
            </div>
          ) : null}
        </section>

        <section className="ai-insight-card">
          <div className="ai-insight-title">
            <Clipboard size={16} />
            <div>
              <strong>Draft pesan</strong>
              <span>Review dan edit sebelum benar-benar dikirim.</span>
            </div>
          </div>
          <div className="ai-draft-message">
            {analysis.outreach.draftMessage}
          </div>
          <div className="ai-draft-actions">
            <button className="button secondary compact" onClick={onCopy}>
              <Clipboard size={14} />
              {copied ? "Tersalin" : "Salin"}
            </button>
            <a
              className={whatsappUrl ? "button secondary compact" : "button secondary compact disabled"}
              href={whatsappUrl || undefined}
              target="_blank"
              rel="noreferrer"
            >
              <ExternalLink size={14} />
              Buka WhatsApp
            </a>
          </div>
        </section>
      </div>

      <details className="ai-evidence">
        <summary>
          Evidence yang digunakan · {analysis.sources.length} sumber
        </summary>
        <div className="ai-evidence-list">
          {analysis.sources.map((source) => (
            <a
              key={source.id}
              href={source.url}
              target="_blank"
              rel="noreferrer"
              className="ai-evidence-item"
            >
              <div>
                <strong>{source.title}</strong>
                <span>{source.type.replaceAll("_", " ")} · {source.confidence}</span>
                {source.excerpt ? <p>{source.excerpt}</p> : null}
              </div>
              <ExternalLink size={14} />
            </a>
          ))}
        </div>
      </details>
    </div>
  );
}

function ScoreItem({ label, value }: { label: string; value: number }) {
  return (
    <div className="ai-score-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
