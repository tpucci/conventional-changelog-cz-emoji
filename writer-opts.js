"use strict";

const compareFunc = require("compare-func");
const Q = require("q");
const readFile = Q.denodeify(require("fs").readFile);
const resolve = require("path").resolve;
const path = require("path");
const pkgJson = {};
const gufg = require("github-url-from-git");

try {
  pkgJson = require(path.resolve(process.cwd(), "./package.json"));
} catch (err) {
  console.error("no root package.json found");
}

function issueUrl() {
  if (
    pkgJson.repository &&
    pkgJson.repository.url &&
    ~pkgJson.repository.url.indexOf("github.com")
  ) {
    var gitUrl = gufg(pkgJson.repository.url);

    if (gitUrl) {
      return gitUrl + "/issues/";
    }
  }
}

function getWriterOpts() {
  return {
    transform: function(commit) {
      let discard = true;
      let issues = [];

      commit.notes.forEach(function(note) {
        note.title = "BREAKING CHANGES";
        discard = false;
      });

      if (commit.type === ":sparkles:") {
        commit.type = "✨ Features";
      } else if (commit.type === ":bug:") {
        commit.type = "🐛 Bug Fixes";
      } else if (commit.type === ":zap:") {
        commit.type = "⚡️ Performance Improvements";
      } else if (commit.type === ":rewind:") {
        commit.type = "⏪ Reverts";
      } else if (commit.type === ":memo:") {
        commit.type = "📝 Documentation";
      } else if (commit.type === ":lipstick:") {
        commit.type = "💄 UI";
      } else if (commit.type === ":recycle:") {
        commit.type = "♻️ Code Refactoring";
      } else if (commit.type === ":white_check_mark:") {
        commit.type = "✅ Tests";
      } else if (commit.type === ":rocket:") {
        commit.type = "🚀 Deploys";
      } else if (discard) {
        return;
      }

      if (commit.scope === "*") {
        commit.scope = "";
      }

      if (typeof commit.hash === "string") {
        commit.hash = commit.hash.substring(0, 7);
      }

      if (typeof commit.subject === "string") {
        let url = issueUrl();
        if (url) {
          // GitHub issue URLs.
          commit.subject = commit.subject.replace(/#([0-9]+)/g, function(
            _,
            issue
          ) {
            issues.push(issue);
            return "[#" + issue + "](" + url + issue + ")";
          });
        }
        // GitHub user URLs.
        commit.subject = commit.subject.replace(
          /@([a-zA-Z0-9_]+)/g,
          "[@$1](https://github.com/$1)"
        );
        commit.subject = commit.subject;
      }

      // remove references that already appear in the subject
      commit.references = commit.references.filter(function(reference) {
        if (issues.indexOf(reference.issue) === -1) {
          return true;
        }

        return false;
      });

      return commit;
    },
    groupBy: "type",
    commitGroupsSort: "title",
    commitsSort: ["scope", "subject"],
    noteGroupsSort: "title",
    notesSort: compareFunc
  };
}

module.exports = Q.all([
  readFile(resolve(__dirname, "templates/template.hbs"), "utf-8"),
  readFile(resolve(__dirname, "templates/header.hbs"), "utf-8"),
  readFile(resolve(__dirname, "templates/commit.hbs"), "utf-8"),
  readFile(resolve(__dirname, "templates/footer.hbs"), "utf-8")
]).spread(function(template, header, commit, footer) {
  const writerOpts = getWriterOpts();

  writerOpts.mainTemplate = template;
  writerOpts.headerPartial = header;
  writerOpts.commitPartial = commit;
  writerOpts.footerPartial = footer;

  return writerOpts;
});
