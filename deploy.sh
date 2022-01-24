#!/usr/bin/env sh

set -e
git push;
node .bin/changeBase.js /write-your-frontend-framework/;
npm run build;

cd dist;
git init
git add -A
git commit -m 'deploy'

git push -f git@github.com:QuarkGluonPlasma/write-your-frontend-framework master:gh-pages
git push -f git@gitee.com:QuarkGluonPlasma/write-your-frontend-framework master:gh-pages

cd -

rm -rf dist

node .bin/changeBase.js 