#!/bin/bash
set -e

# Move to root
cd ../
root_url="$(pwd)"

# Validate input
if [ -z "$1" ]; then
  echo "You must input version number"
  exit 1
fi

# Checkout master branch and discard all change
git reset
git checkout .
git checkout master

# Bump version file
version_file="$root_url/src/version.js"
echo "export default \"$1\";" > $version_file

# Commit and push
git add .
git commit -m "increase version tag"
git push origin master

# Adding tag
git tag "$1"
git push origin "$1"

echo "Deploy version $1 successed"
exit 0
