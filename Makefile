GRUNT_CMD = "./node_modules/grunt/bin/grunt"

sync:
	@${GRUNT_CMD} dev
	@${GRUNT_CMD} watch

compile:
	@${GRUNT_CMD}

dev:
	@${GRUNT_CMD} dev

clean:
	@${GRUNT_CMD} shell:clean

setup:
	@npm install grunt
	@npm install grunt-css
	@npm install grunt-shell
	@npm install grunt-compass
	@npm install ejs
	@npm install grunt-templater
	@npm install grunt-coffee

run: kill-run
	@cd fightcode && python -m SimpleHTTPServer &

kill-run:
	@-ps aux | egrep SimpleHTTPServer | egrep -v egrep | awk ' { print $$2 } ' | xargs kill -9
	@echo 'fightcode server killed!'

