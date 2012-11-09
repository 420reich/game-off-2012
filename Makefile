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
	@cat node-requirements | xargs npm install

run: run-server sync

run-server: kill-server
	@cd fightcode && python -m SimpleHTTPServer &
	@echo
	@echo ">>>>> fightcode server running at http://localhost:8000/index.html <<<<<"
	@echo

kill-server:
	@-ps aux | egrep SimpleHTTPServer | egrep -v egrep | awk ' { print $$2 } ' | xargs kill -9
	@echo 'fightcode server killed!'

