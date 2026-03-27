// pages/api/generate-pdf.ts
import type { NextApiRequest, NextApiResponse } from "next";
import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";

const generatePDF = async (html: string, filePath: string) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Set content with Tailwind CSS included
  const tailwindCSS = `
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.0.0/dist/tailwind.min.css" rel="stylesheet">
  `;
  const fullHTML = `${tailwindCSS}<html><body>${html}</body></html>`;
  await page.setContent(fullHTML, { waitUntil: "networkidle0" });

  // Generate PDF and save to file
  await page.pdf({
    path: filePath,
    printBackground: true,
    format: "A4",
    preferCSSPageSize: true,
  });

  await browser.close();
};

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    const { html } = req.body;
    if (!html) {
      return res.status(400).json({ error: "No HTML provided" });
    }

    try {
      // Generate a random file name
      const fileName = `generated-${Date.now()}.pdf`;
      const filePath = path.join(
        process.cwd(),
        "public",
        "downloads",
        fileName
      );

      // Ensure the directory exists
      fs.mkdirSync(path.dirname(filePath), { recursive: true });

      // Generate and save PDF
      await generatePDF(html, filePath);

      // Provide the file URL
      const fileUrl = `/downloads/${fileName}`;

      // Return the file URL
      res.status(200).json({ fileUrl });

      // Optionally, delete the file after some time
      setTimeout(() => {
        fs.unlink(filePath, (err) => {
          if (err) {
            console.error(`Failed to delete file ${filePath}`, err);
          }
        });
      }, 5 * 60 * 1000); // Delete after 5 minutes
    } catch (error) {
      res.status(500).json({ error: "Failed to generate PDF" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};
