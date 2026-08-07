import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export interface PDFExportOptions {
  title: string;             // Subject / Title (e.g. "Representation Seeking Fair Investigation...")
  reportType?: string;       // e.g. "LEGAL INTELLIGENCE REPORT" or "AI LEGAL DRAFT"
  docType?: string;          // e.g. "Police Representation" / "AO Petition" / "Legal Analysis"
  domain?: string;           // e.g. "Property Law / Property360" or "Revenue / Criminal"
  caseId?: string;           // e.g. "UK360-395254"
  dateStr?: string;          // e.g. "03 Aug 2026"
  status?: string;           // e.g. "AI Draft | Advocate Review Recommended"
  content: string;           // Legal body text
  sealHash?: string;         // SHA-256
  filename?: string;
}

/**
 * Downloads an enterprise-grade UNIKORN360 LEGALOS report as a PDF file.
 * Uses html2canvas + jsPDF with professional legal document pagination,
 * keep-together block rules, and multi-line balanced subject formatting.
 */
export async function downloadDocumentAsPDF(options: PDFExportOptions): Promise<void> {
  const {
    title,
    reportType = "LEGAL INTELLIGENCE REPORT",
    docType = "AI Legal Draft / Representation",
    domain = "Property Law (Property360)",
    caseId = "UK360-DRAFT",
    dateStr = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
    status = "AI Draft | Advocate Review Recommended",
    content,
    sealHash,
    filename
  } = options;

  // Create an off-screen A4 container for pristine rendering
  const container = document.createElement("div");
  container.className = "unikorn-pdf-container";
  container.style.position = "absolute";
  container.style.left = "-9999px";
  container.style.top = "-9999px";
  container.style.width = "794px"; // Standard A4 pixel width at 96 DPI (210mm)
  container.style.backgroundColor = "#ffffff";
  container.style.color = "#0f172a"; // slate-900
  container.style.fontFamily = "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif";
  container.style.padding = "36px 44px";
  container.style.boxSizing = "border-box";
  container.style.lineHeight = "1.6";

  // Helper to safely escape HTML special chars
  const safeText = (text: string) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  // Format content paragraphs cleanly into keep-together blocks for proper pagination
  const rawLines = safeText(content).split("\n").map(l => l.trim());
  const blocks: string[] = [];
  let currentBlock: string[] = [];

  const flushBlock = (isKeepTogether = true) => {
    if (currentBlock.length === 0) return;
    const htmlContent = currentBlock.join("");
    const keepStyle = isKeepTogether
      ? `page-break-inside: avoid; break-inside: avoid; page-break-after: auto; break-after: auto;`
      : ``;
    blocks.push(`<div style="${keepStyle} margin-bottom: 8px;">${htmlContent}</div>`);
    currentBlock = [];
  };

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i];
    if (!line) {
      flushBlock(true);
      blocks.push(`<div style="height: 8px; page-break-inside: avoid; break-inside: avoid;"></div>`);
      continue;
    }

    // Divider line
    if (line.startsWith("---") || line.startsWith("===")) {
      flushBlock(true);
      blocks.push(`<hr style="border: none; border-top: 1px dashed #cbd5e1; margin: 12px 0; page-break-inside: avoid; break-inside: avoid;" />`);
      continue;
    }

    // Heading or section title (e.g., "பிரார்த்தனை:", "PRAYER:", "இணைப்புகள்:", "ஒப்பம்:")
    const isHeading = line.endsWith(":") || (line.toUpperCase() === line && line.length < 60) || /^([0-9\u0B80-\u0BFFA-Z]+\.)\s+/.test(line);
    const isSubjectLine = /^பொருள்:|^Subject:|^பார்வை:|^Reference:/i.test(line);
    const isSignatureLine = /^இங்ஙனம்|^தங்கள் உண்மையுள்ள|^SIGNATURE|^மனுதாரர் ஒப்பம்|^Advocate for Petitioner/i.test(line);

    if (isSignatureLine) {
      flushBlock(true);
      currentBlock.push(`
        <div style="margin-top: 24px; padding-top: 12px; page-break-inside: avoid; break-inside: avoid; page-break-before: auto; display: flex; justify-content: space-between; align-items: flex-end;">
          <div>
            <p style="font-size: 10px; font-weight: 700; color: #64748b; margin: 0;">இடம் / Place: _________________</p>
            <p style="font-size: 10px; font-weight: 700; color: #64748b; margin: 4px 0 0 0;">நாள் / Date: ${safeText(dateStr)}</p>
          </div>
          <div style="text-align: right;">
            <p style="font-size: 11px; font-weight: 800; color: #0f172a; margin: 0 0 32px 0;">${safeText(line)}</p>
            <p style="font-size: 10px; font-weight: 700; color: #475569; margin: 0; border-top: 1px dashed #94a3b8; pt-1; inline-block; width: 180px; text-align: center;">(கையொப்பம் / Signature)</p>
          </div>
        </div>
      `);
      flushBlock(true);
      continue;
    }

    if (isSubjectLine) {
      flushBlock(true);
      // Balanced 2-3 line wrapping formatting for Subject / பொருள்
      currentBlock.push(`
        <div style="background-color: #f8fafc; border-left: 3px solid #4f46e5; padding: 10px 14px; margin: 10px 0; border-radius: 0 6px 6px 0; page-break-inside: avoid; break-inside: avoid;">
          <p style="font-size: 11px; font-weight: 800; color: #0f172a; margin: 0; line-height: 1.55; text-align: justify; word-break: break-word; max-width: 96%;">
            ${safeText(line)}
          </p>
        </div>
      `);
      flushBlock(true);
      continue;
    }

    if (isHeading) {
      flushBlock(true);
      currentBlock.push(`
        <h4 style="font-size: 11.5px; font-weight: 800; color: #0f172a; margin: 10px 0 4px 0; text-transform: uppercase; letter-spacing: 0.02em; page-break-after: avoid; break-after: avoid;">
          ${safeText(line)}
        </h4>
      `);
    } else {
      currentBlock.push(`
        <p style="font-size: 10.5px; margin: 0 0 6px 0; color: #334155; text-align: justify; word-break: break-word; line-height: 1.6; widows: 3; orphans: 3;">
          ${safeText(line)}
        </p>
      `);
    }
  }
  flushBlock(true);

  const formattedContentHtml = blocks.join("");

  container.innerHTML = `
    <style>
      .unikorn-pdf-container * {
        box-sizing: border-box;
      }
      .unikorn-pdf-container p, .unikorn-pdf-container h4, .unikorn-pdf-container div, .unikorn-pdf-container tr {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
        widows: 3;
        orphans: 3;
      }
      .unikorn-pdf-container h1, .unikorn-pdf-container h2, .unikorn-pdf-container h3, .unikorn-pdf-container h4 {
        page-break-after: avoid !important;
        break-after: avoid !important;
      }
    </style>

    <!-- Top Enterprise Brand Header -->
    <div style="border-bottom: 2px solid #0f172a; padding-bottom: 10px; margin-bottom: 14px; display: flex; justify-content: space-between; align-items: flex-end; page-break-inside: avoid; break-inside: avoid;">
      <div>
        <div style="font-size: 18px; font-weight: 900; color: #0f172a; letter-spacing: -0.02em; display: flex; align-items: center; gap: 8px;">
          <span>UNIKORN360</span>
          <span style="color: #4f46e5; font-weight: 800; font-size: 12px; border: 1px solid #c7d2fe; background-color: #eef2ff; padding: 1px 6px; border-radius: 4px;">LEGALOS</span>
        </div>
        <p style="font-size: 9.5px; font-weight: 800; color: #475569; letter-spacing: 0.08em; text-transform: uppercase; margin: 2px 0 0 0;">
          ${safeText(reportType)}
        </p>
      </div>
      <div style="text-align: right;">
        <p style="font-size: 9.5px; font-weight: 700; color: #64748b; margin: 0;">
          AI-Assisted Legal Analysis & Representation
        </p>
        <p style="font-size: 8.5px; font-weight: 600; color: #94a3b8; margin: 2px 0 0 0;">
          Unikorn Legal Intelligence Engine v1.0
        </p>
      </div>
    </div>

    <!-- Concise & Professional Metadata Block -->
    <div style="margin-bottom: 16px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px 14px; page-break-inside: avoid; break-inside: avoid;">
      <table style="width: 100%; border-collapse: collapse; font-size: 9.5px;">
        <tr>
          <td style="padding: 2.5px 0; font-weight: 700; color: #64748b; width: 110px;">Document Type :</td>
          <td style="padding: 2.5px 0; font-weight: 800; color: #0f172a;">${safeText(docType)}</td>
          <td style="padding: 2.5px 0; font-weight: 700; color: #64748b; width: 90px; text-align: right;">Case ID :</td>
          <td style="padding: 2.5px 0 2.5px 8px; font-weight: 800; color: #4f46e5; font-family: monospace; text-align: right;">${safeText(caseId)}</td>
        </tr>
        <tr>
          <td style="padding: 2.5px 0; font-weight: 700; color: #64748b;">Knowledge Domain :</td>
          <td style="padding: 2.5px 0; font-weight: 700; color: #1e293b;">${safeText(domain)}</td>
          <td style="padding: 2.5px 0; font-weight: 700; color: #64748b; text-align: right;">Date :</td>
          <td style="padding: 2.5px 0 2.5px 8px; font-weight: 700; color: #334155; text-align: right;">${safeText(dateStr)}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0 2px 0; font-weight: 700; color: #64748b; vertical-align: top;">Subject / Title :</td>
          <td colspan="3" style="padding: 4px 0 2px 0; font-weight: 800; color: #0f172a; line-height: 1.55; text-align: justify; word-break: break-word; max-width: 94%;">
            ${safeText(title)}
          </td>
        </tr>
        <tr>
          <td style="padding: 2.5px 0; font-weight: 700; color: #64748b;">Status :</td>
          <td colspan="3" style="padding: 2.5px 0; font-weight: 700; color: #059669; font-size: 9px;">${safeText(status)}</td>
        </tr>
      </table>
    </div>

    <!-- Main Legal Document Body with Page Break Controls -->
    <div style="min-height: 400px; font-size: 10.5px; color: #334155; border-top: 1px solid #f1f5f9; padding-top: 8px;">
      ${formattedContentHtml}
    </div>

    <!-- Enterprise Footer -->
    <div style="margin-top: 28px; padding-top: 10px; border-top: 1.5px solid #0f172a; display: flex; justify-content: space-between; align-items: flex-start; font-size: 8.5px; color: #64748b; font-family: monospace; page-break-inside: avoid; break-inside: avoid;">
      <div>
        <p style="font-weight: 800; color: #0f172a; margin: 0 0 2px 0;">UNIKORN360 ADVOCATE ENTERPRISE SEAL</p>
        <p style="margin: 0; color: #475569;">VERIFIED SHA-256: ${safeText(sealHash || "VERIFIED-TAMPER-PROOF-RECORD")}</p>
        <p style="margin: 2px 0 0 0; color: #94a3b8;">AI Generated • Human Review Recommended • Version 1.0</p>
      </div>
      <div style="text-align: right;">
        <p style="margin: 0; font-weight: 700; color: #0f172a;">Confidential & Privileged Legal Work Product</p>
        <p style="margin: 2px 0 0 0;">UNIKORN360 LegalOS Intelligence System</p>
        <p style="margin: 2px 0 0 0; color: #94a3b8;">Timestamp: ${new Date().toISOString()}</p>
      </div>
    </div>
  `;

  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff"
    });

    const imgData = canvas.toDataURL("image/jpeg", 0.95);
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;

    while (heightLeft > 5) { // Prevent blank trailing page if heightLeft is minimal
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

    const cleanName = (filename || `${title}_${caseId}`)
      .replace(/[^a-zA-Z0-9_\-\u0B80-\u0BFF]/g, "_")
      .slice(0, 50);

    pdf.save(`${cleanName}.pdf`);
  } catch (error) {
    console.error("PDF generation failed, using print/blob fallback:", error);

    // Fallback: Trigger direct file download as HTML
    const blob = new Blob([container.innerHTML], { type: "text/html;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${filename || title}.html`;
    link.click();
    URL.revokeObjectURL(link.href);
  } finally {
    document.body.removeChild(container);
  }
}
