import json
import subprocess
from urllib.parse import parse_qs, urlparse

def handler(request):
    url = request.args.get("url")
    if not url:
        return {
            "statusCode": 400,
            "body": json.dumps({"error": "url parameter is required"})
        }

    try:
        # yt-dlp JSON取得
        proc = subprocess.run(
            ["yt-dlp", "-J", url],
            capture_output=True,
            text=True,
            timeout=8
        )

        if proc.returncode != 0:
            return {
                "statusCode": 500,
                "body": json.dumps({"error": proc.stderr})
            }

        data = json.loads(proc.stdout)

        formats = []
        for f in data.get("formats", []):
            if "url" in f:
                formats.append({
                    "format_id": f.get("format_id"),
                    "ext": f.get("ext"),
                    "vcodec": f.get("vcodec"),
                    "acodec": f.get("acodec"),
                    "filesize": f.get("filesize"),
                    "fps": f.get("fps"),
                    "resolution": f.get("resolution"),
                    "url": f["url"],
                })
