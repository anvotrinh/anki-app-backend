import { Converter } from "showdown";
import fs from "fs";
import path from "path";

export default function(req, res, next) {
  try {
    const doc_path = path.join(__dirname, "../../doc/api.md");
    fs.readFile(doc_path, { encoding: "utf-8" }, function(err, data) {
      if (err) throw err;
      const converter = new Converter();
      converter.setFlavor("github");
      const converted = converter.makeHtml(data);
      const styles =
        "https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/2.10.0/github-markdown.min.css";
      const html = `
      <head>
        <link rel="stylesheet" type="text/css" href="${styles}"/>
      </head>
      <body style="padding: 45px; margin: 0">
        <div class="markdown-body">
          ${converted}
        </div>
      </body>`;
      res.send(html);
    });
  } catch (error) {
    next(error);
  }
}
