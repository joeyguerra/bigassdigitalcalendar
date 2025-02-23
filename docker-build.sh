#!/bin/bash
set -e
npm version patch --no-git-tag-version
VERSION=$(node -p "require('./package.json').version")
sed -i '' -e "s|local/bigassdigitalcalendar-website:[0-9]*\.[0-9]*\.[0-9]*|local/bigassdigitalcalendar-website:$VERSION|g" charts/web/deployment.yaml
docker build -t local/bigassdigitalcalendar-website:$VERSION .
