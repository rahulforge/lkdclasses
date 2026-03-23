import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer-core";
import { supabaseRest } from "@/lib/supabaseRest";
import path from "path";
import { readFile } from "fs/promises";

export const dynamic = "force-dynamic";
const chromePath =
  process.env.CHROME_PATH ||
  "C:\\\\Program Files\\\\Google\\\\Chrome\\\\Application\\\\chrome.exe";

async function imageToDataUrl(url: string): Promise<string> {
  try {
    const res = await fetch(url);
    if (!res.ok) return url;
    const contentType = res.headers.get("content-type") || "image/png";
    const buffer = Buffer.from(await res.arrayBuffer());
    return `data:${contentType};base64,${buffer.toString("base64")}`;
  } catch {
    return url;
  }
}

async function fileToDataUrl(filePath: string): Promise<string | null> {
  try {
    const buffer = await readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const contentType =
      ext === ".png"
        ? "image/png"
        : ext === ".jpg" || ext === ".jpeg"
        ? "image/jpeg"
        : "application/octet-stream";
    return `data:${contentType};base64,${buffer.toString("base64")}`;
  } catch {
    return null;
  }
}

/* ----------------------------- HTML GENERATOR ----------------------------- */
function buildHtml(input: {
  name: string;
  rollNumber: string;
  className: string;
  rank: string;
  rankOutOf: string | null;
  percentage: string;
  backgroundUrl: string;
}) {
  const s = (v: string) =>
    String(v ?? "-")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<title>Certificate</title>

<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Poppins:wght@400;500;600&display=swap" rel="stylesheet">

<style>
  * { box-sizing: border-box; }

  body {
    margin: 0;
    font-family: 'Poppins', sans-serif;
    background: #fff;
  }

  .page {
    width: 1123px;
    height: 794px;
    position: relative;
    background-color: #fff;
    background-image: url('${input.backgroundUrl}');
    background-repeat: no-repeat;
    background-position: center;
    background-size: cover;
  }

  /* OVERLAY CONTENT */
  .overlay {
    position: absolute;
    inset: 0;
    padding: 80px 120px;
  }

  /* NAME (MAIN FOCUS) */
  .name {
    position: absolute;
    top: 360px;
    left: 0;
    width: 100%;
    text-align: center;
    font-family: 'Playfair Display', serif;
    font-size: 40px;
    color: #0b2a6f;
    letter-spacing: 1px;
  }

  .name-line {
    width: 500px;
    height: 2px;
    background: #d4af37;
    margin: 8px auto 0;
  }

  /* DETAILS SECTION */
  .details {
    position: absolute;
    top: 440px;
    left: 50%;
    transform: translateX(-50%);
    width: 70%;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 36px;
    text-align: center;
  }

  .field {
    font-size: 20px;
    font-weight: 600;
    color: #0b2a6f;
    letter-spacing: 0.5px;
    text-transform: uppercase;
  }

  .value {
    margin-top: 6px;
    font-size: 22px;
    font-weight: 700;
    border-bottom: 2px solid #0b2a6f;
    padding-bottom: 6px;
  }

  /* OPTIONAL SECOND ROW */
  .details-row-2 {
    margin-top: 20px;
    grid-column: span 3;
    display: flex;
    justify-content: center;
  }

  .date {
    width: 200px;
    text-align: center;
  }

</style>
</head>

<body>
  <div class="page">
    <div class="overlay">

      <!-- NAME -->
      <div class="name">
        ${s(input.name)}
        <div class="name-line"></div>
      </div>

      <!-- DETAILS -->
      <div class="details">
        <div class="field">
          Class
          <div class="value">${s(input.className)}</div>
        </div>

        <div class="field">
          Roll Number
          <div class="value">${s(input.rollNumber)}</div>
        </div>

        <div class="field">
          Rank
          <div class="value">${
            input.rankOutOf ? `${s(input.rank)}/${s(input.rankOutOf)}` : s(input.rank)
          }</div>
        </div>
      </div>

    </div>
  </div>
</body>
</html>`;
}
/* ----------------------------- API ROUTE ----------------------------- */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const roll = String(searchParams.get("roll") ?? "").trim();

    if (!roll) {
      return NextResponse.json(
        { error: "Roll number is required" },
        { status: 400 }
      );
    }

    const rows = await supabaseRest.from<any[]>(
      "tse_results",
      `roll_number=eq.${encodeURIComponent(
        roll
      )}&select=roll_number,student_name,rank,percentage,exam_name,test_date,class&limit=1`,
      "GET"
    );

    const row = rows[0];

    if (!row) {
      return NextResponse.json(
        { error: "Result not found" },
        { status: 404 }
      );
    }

    const classWiseTotals: Record<string, string> = {
      "6": "100",
      "7": "100",
      "8": "100",
      "9": "100",
      "10": "100",
      "11": "190",
      "12": "140",
    };
    const classKey = String(row.class ?? "").trim().toLowerCase();
    const rankOutOf = classWiseTotals[classKey] ?? null;

    const origin = new URL(req.url).origin;
    const assetBase = process.env.NEXT_PUBLIC_SITE_URL || origin;
    const baseTemplateUrl = `${assetBase}/certificates/tse-template.png`;
    const templatePath = path.join(
      process.cwd(),
      "public",
      "certificates",
      "tse-template.png"
    );
    const templateUrl =
      (await fileToDataUrl(templatePath)) ||
      (await imageToDataUrl(baseTemplateUrl));

    const html = buildHtml({
      name: row.student_name,
      rollNumber: row.roll_number,
      className: row.class,
      rank: row.rank,
      rankOutOf,
      percentage: row.percentage,
      backgroundUrl: templateUrl,
    });

    const isServerless = Boolean(
      process.env.AWS_LAMBDA_FUNCTION_NAME ||
        process.env.LAMBDA_TASK_ROOT ||
        process.env.AWS_EXECUTION_ENV ||
        process.env.NETLIFY
    );
    let executablePath = chromePath;
    let launchArgs = ["--no-sandbox", "--disable-setuid-sandbox"];
    let headless: boolean | "new" = true;
    let defaultViewport: { width: number; height: number } | undefined = {
      width: 1123,
      height: 794,
    };

    if (isServerless) {
      if (!process.env.AWS_LAMBDA_JS_RUNTIME) {
        process.env.AWS_LAMBDA_JS_RUNTIME = "nodejs20.x";
      }
      if (!process.env.LD_LIBRARY_PATH) {
        process.env.LD_LIBRARY_PATH =
          "/var/task/node_modules/@sparticuz/chromium/lib";
      }
      if (!process.env.FONTCONFIG_PATH) {
        process.env.FONTCONFIG_PATH = "/tmp/fonts";
      }
      const chromium = (await import("@sparticuz/chromium")).default;
      executablePath = await chromium.executablePath();
      launchArgs = chromium.args;
      headless = true;
      defaultViewport = chromium.defaultViewport;
    }

    const browser = await puppeteer.launch({
      args: launchArgs,
      executablePath,
      headless,
      defaultViewport,
    });

    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(0);
    page.setDefaultTimeout(0);
    await page.setViewport({ width: 1123, height: 794, deviceScaleFactor: 1 });
    await page.setContent(html, { waitUntil: "domcontentloaded", timeout: 0 });
    await page.emulateMediaType("screen");

    const pdf = await page.pdf({
      width: "1123px",
      height: "794px",
      printBackground: true,
      margin: {
        top: "0mm",
        bottom: "0mm",
        left: "0mm",
        right: "0mm",
      },
    });

    await browser.close();

    return new NextResponse(Buffer.from(pdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Length": String(pdf.byteLength),
        "Content-Disposition": `attachment; filename="TSE-${roll}.pdf"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to generate certificate" },
      { status: 500 }
    );
  }
}
