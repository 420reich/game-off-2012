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

drop:
	psql -d postgres -f drop.sql

run: run-server sync

run-server: kill-server
	@node fightcode/app.js &
	@echo
	@echo ">>>>> fightcode server running at http://localhost:3000/index.html <<<<<"
	@echo

kill-server:
	@-ps aux | egrep fightcode | egrep -v egrep | awk ' { print $$2 } ' | xargs kill -9
	@echo 'fightcode server killed!'

postgre:
	@pg_ctl -D /usr/local/var/postgres -l /usr/local/var/postgres/server.log start

kill_postgre:
	@pg_ctl -D /usr/local/var/postgres stop -s -m fast
