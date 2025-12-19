import express from "express";
import { execFile } from "child_process";
import util from "util";

const execFileAsync = util.promisify(execFile);
const app = express();

app.get("/", async (req, res) => {
  const url = req.query.url;
  if (!url) {
    return res.status(400).json({ error: "url is required" });
  }

  try {
    // yt-dlp を実行（-J = JSON）
    const { stdout } = await execFileAsync(
      "yt-dlp",
      ["-J", url],
      { timeout: 8000 }
    );

    const data = JSON.parse(stdout);

    const formats = (data.formats || [])
      .filter(f => f.url)
      .map(f => ({
        format_id: f.format_id,
        ext: f.ext,
        vcodec: f.vcodec,
        acodec: f.acodec,
        resolution: f.resolution,
        fps: f.fps,
        filesize: f.filesize,
        url: f.url
      }));

    res.setHeader("Cache-Control", "no-store");
    res.json({
      id: data.id,
      title: data.title,
      formats
    });

  } catch (err) {
    res.status(500).json({
      error: "yt-dlp failed",
      detail: err.stderr || err.message
    });
  }
});

export default app;
