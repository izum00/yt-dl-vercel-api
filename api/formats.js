import { execFile } from "child_process";
import path from "path";

export default async function handler(req, res) {
  const { url } = req.query;
  if (!url) {
    return res.status(400).json({ error: "url is required" });
  }

  const ytdlpPath = path.join(process.cwd(), "bin", "yt-dlp");

  execFile(
    ytdlpPath,
    ["-J", url],
    { maxBuffer: 10 * 1024 * 1024 },
    (err, stdout, stderr) => {
      if (err) {
        return res.status(500).json({
          error: "yt-dlp failed",
          details: stderr,
        });
      }

      const data = JSON.parse(stdout);

      const formats = data.formats.map(f => ({
        format_id: f.format_id,
        ext: f.ext,
        resolution: f.resolution,
        fps: f.fps,
        vcodec: f.vcodec,
        acodec: f.acodec,
        filesize: f.filesize,
        url: f.url, // ← googlevideo.com/videoplayback
      }));

      res.status(200).json({
        title: data.title,
        duration: data.duration,
        formats,
      });
    }
  );
}
