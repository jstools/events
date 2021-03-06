# --- promise-q

install:
	npm install

lint:
	$(shell npm bin)/eslint src

build:
	$(shell npm bin)/rollup src/azazel.js --output.format cjs --output.file dist/azazel.js
	$(shell npm bin)/rollup src/azazel.js --output.format umd --output.file dist/azazel.min.js -n Azazel
	$(shell npm bin)/uglifyjs dist/azazel.min.js -o dist/azazel.min.js -c -m

install-build: install build

test.events:
	$(shell npm bin)/mocha tests

karma:
	@$(shell npm bin)/karma start karma.conf.js

test: build test.events karma

# release: test
# 	@echo "\nrunning https://gist.githubusercontent.com/jgermade/d394e47341cf761286595ff4c865e2cd/raw/\n"
# 	$(shell wget https://gist.githubusercontent.com/jgermade/d394e47341cf761286595ff4c865e2cd/raw/ -O - | sh -)

npm.increaseVersion:
	npm version patch --no-git-tag-version

npm.pushVersion: npm.increaseVersion
	git commit -a -n -m "v$(shell node -e "process.stdout.write(require('./package').version + '\n')")" 2> /dev/null; true
	git push origin $(master_branch)

git.tag: export PKG_VERSION=$(shell node -e "process.stdout.write('v'+require('./package.json').version);")
git.tag:
	git pull --tags
	git add dist -f --all
	- git commit -n -m "${PKG_VERSION}" 2> /dev/null; true
	git tag -a $(PKG_VERSION) -m "$(PKG_VERSION)"
	git push --tags
	# git push origin $(git_branch)

npm.publish: build test npm.pushVersion git.tag
	cp package.json dist
	cp README.md dist
	cp LICENSE dist
	- cd dist && npm publish --access public
	- node -e "var fs = require('fs'); var pkg = require('./dist/package.json'); pkg.name = 'azazel'; fs.writeFile('dist/package.json', JSON.stringify(pkg, null, '  '), 'utf8', function (err) { if( err ) console.log('Error: ' + err); });"
	- cd dist && npm publish
	cp package.json dist

github.release: export PKG_NAME=$(shell node -e "console.log(require('./package.json').name);")
github.release: export PKG_VERSION=$(shell node -e "process.stdout.write('v'+require('./package.json').version);")
github.release: export RELEASE_URL=$(shell curl -s -X POST -H "Content-Type: application/json" -H "Authorization: Bearer ${GITHUB_TOKEN}" \
	-d '{"tag_name": "${PKG_VERSION}", "target_commitish": "$(git_branch)", "name": "${PKG_VERSION}", "body": "", "draft": false, "prerelease": false}' \
	-w '%{url_effective}' "https://api.github.com/repos/kiltjs/azazel/releases" )
github.release:
	@echo ${RELEASE_URL}
	git reset --soft HEAD~1
	git reset HEAD
	# git reset --hard origin/$(git_branch)
	@git checkout $(git_branch)
	# @true

release: npm.publish github.release

# DEFAULT TASKS

.DEFAULT_GOAL := install-build
