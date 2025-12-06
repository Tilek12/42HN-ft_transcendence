#!/usr/bin/env bash
# Portable contributions report for macOS (no declare -A, no asorti)
# Usage: ./contributions.sh [git-log-options...]

git_log_opts=( "$@" )

# Mapping email → main contributor
# Edit the mappings below. Format is "main: email1 email2 email3"
# Keep everything lowercase or it will be lowercased for matching.
AUTHOR_MAP=$(cat <<'MAP'
pstrohal: pstrohal@student.42heilbronn.de p.strohal@outlook.de pstrohal@2-e-9.42heilbronn.de pstrohal@2-e-2.42heilbronn.de pstrohal@2-d-5.42heilbronn.de pstrohal@2-e-7.42heilbronn.de
tkubanyc: tkubanyc@student.42heilbronn.de 62654424+tilek12@users.noreply.github.com
tnakas: tnakas@2-h-7.42heilbronn.de tnakas@2-h-3.42heilbronn.de tnakas@2-h-8.42heilbronn.de tnakas@2-f-4.42heilbronn.de tnakas@2-f-2.42heilbronn.de tnakas@1-b-27.42heilbronn.de tnakas@2-i-7.42heilbronn.de tnakas@2-i-4.42heilbronn.de tnakas@2-e-4.42heilbronn.de tnakas@1-e-26.42heilbronn.de tnakas@2-g-9.42heilbronn.de
linda: lindalacsivy@outlook.de
ryusupov: ryusupov788@gmail.com
MAP
)

# convert mapping to "email:main;" format (lowercased for robust matching)
awk_map=""
while IFS= read -r line; do
  # skip empty lines or lines without colon
  [ -z "$line" ] && continue
  case "$line" in
    *:*) ;;
    *) continue ;;
  esac
  main=${line%%:*}
  emails=${line#*:}
  # trim spaces
  main="$(echo "$main" | awk '{$1=$1;print}' )"
  for email in $emails; do
    # lowercase
    le=$(echo "$email" | tr 'A-Z' 'a-z')
    awk_map+="$le:$main;"
  done
done <<< "$AUTHOR_MAP"

# Produce per-author raw summary with awk (portable)
# Fields output: author<TAB>commits<TAB>files<TAB>insertions<TAB>deletions<TAB>total
git log "${git_log_opts[@]}" --format='author: %ae' --numstat \
  | tr 'A-Z' 'a-z' \
  | grep -v '^$' \
  | grep -v '^-' \
  | awk -v map="$awk_map" '
    BEGIN {
      # parse map string "email:main;email:main;..."
      n = split(map, pairs, ";")
      for (i = 1; i <= n; i++) {
        if (pairs[i] == "") continue
        split(pairs[i], kv, ":")
        emailmap[kv[1]] = kv[2]
      }
      author = ""
    }
    {
      if ($1 == "author:") {
        original = $2
        if (original in emailmap)
          author = emailmap[original]
        else
          author = original
        commits[author]++
      } else {
        # numstat lines: insertions deletions filename
        ins = ($1 == "-" ? 0 : $1) + 0
        del = ($2 == "-" ? 0 : $2) + 0
        insertions[author] += ins
        deletions[author] += del
        total[author] += ins + del
        file_key = author ":" $3
        if (!(file_key in seen)) {
          seen[file_key] = 1
          files[author]++
        }
      }
    }
    END {
      for (a in total) {
        printf("%s\t%d\t%d\t%d\t%d\t%d\n", a, commits[a]+0, files[a]+0, insertions[a]+0, deletions[a]+0, total[a]+0)
      }
    }
' \
  | sort -t$'\t' -k6 -nr \
  | awk -F'\t' '
    BEGIN {
      # header formatting widths
      hdr_fmt = "%-20s\t%-10s\t%-10s\t%-12s\t%-12s\t%-12s\n"
      row_fmt = "%-20s\t%-10d\t%-10d\t%-12d\t%-12d\t%-12d\n"
      print ""
      printf hdr_fmt, "Author", "Commits", "Files", "Insertions", "Deletions", "Total Lines"
      printf hdr_fmt, "------", "-------", "-----", "----------", "---------", "-----------"
      i = 0
      max_total = 0
      max_commits = 0
      max_insertions = 0
    }
    {
      i++
      author[i] = $1
      commits[i] = $2 + 0
      files[i] = $3 + 0
      insertions[i] = $4 + 0
      deletions[i] = $5 + 0
      total[i] = $6 + 0
      if (total[i] > max_total) max_total = total[i]
      if (commits[i] > max_commits) max_commits = commits[i]
      if (insertions[i] > max_insertions) max_insertions = insertions[i]
    }
    END {
      # print rows in already-sorted order
      for (j = 1; j <= i; j++) {
        printf row_fmt, author[j], commits[j], files[j], insertions[j], deletions[j], total[j]
      }

      # ASCII bar chart helper
      if (i == 0) exit

      print "\nVisual representation (Total Lines):"
      for (j = 1; j <= i; j++) {
        v = total[j]
        len = (max_total > 0) ? int((v / max_total) * 40 + 0.5) : 0
        bar = ""
        for (k = 1; k <= len; k++) bar = bar "█"
        printf("%-20s | %-40s %d\n", author[j], bar, v)
      }

      print "\nCommits:"
      for (j = 1; j <= i; j++) {
        v = commits[j]
        len = (max_commits > 0) ? int((v / max_commits) * 40 + 0.5) : 0
        bar = ""
        for (k = 1; k <= len; k++) bar = bar "█"
        printf("%-20s | %-40s %d\n", author[j], bar, v)
      }

      print "\nInsertions:"
      for (j = 1; j <= i; j++) {
        v = insertions[j]
        len = (max_insertions > 0) ? int((v / max_insertions) * 40 + 0.5) : 0
        bar = ""
        for (k = 1; k <= len; k++) bar = bar "█"
        printf("%-20s | %-40s %d\n", author[j], bar, v)
      }
    }
'
