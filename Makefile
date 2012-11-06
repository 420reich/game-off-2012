GRUNT_CMD = "./node_modules/grunt/bin/grunt"

sync watch:
	@${GRUNT_CMD} dev
	@${GRUNT_CMD} watch

compile:
	@${GRUNT_CMD}

dev:
	@${GRUNT_CMD} dev

clean:
	@${GRUNT_CMD} shell:clean

setup:
	@rm -rf ./node_modules
	@npm install grunt
	@npm install grunt-css
	@npm install grunt-shell
	@npm install grunt-compass
	@npm install ejs
	@npm install grunt-templater
	@npm install grunt-coffee
	@npm install growl
	@npm install grunt-growl

run: run-server sync

run-server: kill-server
	@cd fightcode && python -m SimpleHTTPServer &
	@echo
	@echo ">>>>> fightcode server running at http://localhost:8000/index.html <<<<<"
	@echo

kill-server:
	@-ps aux | egrep SimpleHTTPServer | egrep -v egrep | awk ' { print $$2 } ' | xargs kill -9
	@echo 'fightcode server killed!'

