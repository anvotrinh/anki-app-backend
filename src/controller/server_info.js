import version from "../version";
import db from "../model/connection";

export default function(req, res) {
  res.json({
    version,
    uptime: process.uptime(),
    db: db.info()
  });
}
