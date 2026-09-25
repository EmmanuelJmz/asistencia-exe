g#!/usr/bin/env bash

# Usage examples:
# ./gitstats.sh --since '1 month ago';
# ./gitstats.sh --since '1 month ago' --until '1 day ago';
# ./gitstats.sh --author 'GreenRaccoon23' --since '1 month ago' --until '1 day ago';

_commitStats() {
    git log --pretty=format:'noop' "$@" | awk 'END {print NR, "commits"}';
};

_lineStats() {
    git log --pretty=format:'' --numstat "$@" | awk 'NF' | awk '{insertions+=$1; deletions+=$2} END {print NR, "files changed,", insertions, "insertions(+),", deletions, "deletions(+)"}';
};

_commitStats "$@";
_lineStats "$@";

# Credits:
# https://stackoverflow.com/a/48575013/4257217
# https://stackoverflow.com/a/4593065/4257217
# https://gist.github.com/Xeoncross/4020489
