#!/bin/bash

# Mapping email → main contributor
# Add or edit the mappings below
declare -A AUTHOR_MAP=(
  ["pstrohal"]="pstrohal@student.42heilbronn.de p.strohal@outlook.de pstrohal@2-e-9.42heilbronn.de pstrohal@2-e-2.42heilbronn.de pstrohal@2-d-5.42heilbronn.de pstrohal@2-e-7.42heilbronn.de"
  ["tkubanyc"]="tkubanyc@student.42heilbronn.de 62654424+tilek12@users.noreply.github.com"
  ["tnakas"]="tnakas@2-h-7.42heilbronn.de tnakas@2-h-3.42heilbronn.de tnakas@2-h-8.42heilbronn.de tnakas@2-f-4.42heilbronn.de tnakas@2-f-2.42heilbronn.de tnakas@1-b-27.42heilbronn.de tnakas@2-i-7.42heilbronn.de tnakas@2-i-4.42heilbronn.de tnakas@2-e-4.42heilbronn.de tnakas@1-e-26.42heilbronn.de tnakas@2-g-9.42heilbronn.de"
  ["linda"]="lindalacsivy@outlook.de"
  ["ryusupov"]="ryusupov788@gmail.com"
)

git_log_opts=( "$@" )

# Convert mapping to a format AWK can read
awk_map=""
for main in "${!AUTHOR_MAP[@]}"; do
  for email in ${AUTHOR_MAP[$main]}; do
    awk_map+="$email:$main;"
  done
done

git log "${git_log_opts[@]}" --format='author: %ae' --numstat \
  | tr 'A-Z' 'a-z' \
  | grep -v '^$' \
  | grep -v '^-' \
  | awk -v map="$awk_map" '
      BEGIN {
        # Parse map "email:main;email:main;..."
        n = split(map, pairs, ";")
        for (i = 1; i <= n; i++) {
          split(pairs[i], kv, ":")
          if (kv[1] != "") emailmap[kv[1]] = kv[2]
        }
      }

      {
        if ($1 == "author:") {
          original = $2
          # Remap email → main author
          if (original in emailmap)
            author = emailmap[original]
          else
            author = original  # fallback if unmapped email appears
          commits[author]++
        } else {
          insertions[author] += $1
          deletions[author] += $2
          total[author] += $1 + $2

          file_key = author ":" $3
          if (!(file_key in seen)) {
            seen[file_key] = 1
            files[author]++
          }
        }
      }

      END {
        printf("%-20s\t%-10s\t%-10s\t%-12s\t%-12s\t%-12s\n",
               "Author", "Commits", "Files",
               "Insertions", "Deletions", "Total Lines")
        printf("%-20s\t%-10s\t%-10s\t%-12s\t%-12s\t%-12s\n",
               "------", "-------", "-----",
               "----------", "---------", "-----------")

        n = asorti(total, sorted, "@val_num_desc")
        for (i = 1; i <= n; i++) {
          a = sorted[i]
          printf("%-20s\t%-10d\t%-10d\t%-12d\t%-12d\t%-12d\n",
                 a, commits[a], files[a],
                 insertions[a], deletions[a], total[a])
        }
 

# ----- ASCII BAR CHART -----
print "\nVisual representation (Total Lines):"
max = 0

# find max total value
for (a in total)
    if (total[a] > max) max = total[a]

# draw bars (scaled to max 40 chars width)
for (i = 1; i <= n; i++) {
    a = sorted[i]
    bar_len = int((total[a] / max) * 40)
    bar = ""
    for (j = 1; j <= bar_len; j++) bar = bar "█"
    printf("%-12s | %-40s %d\n\n", a, bar, total[a])
}

print "\nCommits:"
maxc = 0
for (a in commits)
    if (commits[a] > maxc) maxc = commits[a]

for (i = 1; i <= n; i++) {
    a = sorted[i]
    bar_len = int((commits[a] / maxc) * 40)
    bar = ""
    for (j = 1; j <= bar_len; j++) bar = bar "█"
    printf("%-12s | %-40s %d\n\n", a, bar, commits[a])
}

print "\nInsertions:"
maxi = 0
for (a in insertions)
    if (insertions[a] > maxi) maxi = insertions[a]

for (i = 1; i <= n; i++) {
    a = sorted[i]
    bar_len = int((insertions[a] / maxi) * 40)
    bar = ""
    for (j = 1; j <= bar_len; j++) bar = bar "█"
    printf("%-12s | %-40s %d\n\n", a, bar, insertions[a])
}
     }
'