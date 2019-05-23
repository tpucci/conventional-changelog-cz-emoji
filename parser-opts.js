"use strict";

module.exports = {
  headerPattern: /^(\:\w*\:) (?:\(([\w\$\.\-\* ]*)\)) (.*)$/,
  headerCorrespondence: ["type", "scope", "subject"],
  noteKeywords: ["BREAKING CHANGE", "BREAKING CHANGES", "NOTE"],
  revertPattern: /^revert:\s([\s\S]*?)\s*This reverts commit (\w*)\./,
  revertCorrespondence: ["header", "hash"]
};
