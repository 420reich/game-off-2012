GRUNT_CMD = "./node_modules/grunt/bin/grunt"
POSTGRES_DATA_FOLDER = "/usr/local/var/postgres"

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

kill-monitor:
	@-ps aux | egrep node_modules/forever/bin/monitor | egrep -v egrep | awk ' { print $$2 } ' | xargs kill -9
	@echo 'Forever monitor killed!'


run: kill-monitor sync

drop:
	psql -d postgres -f drop.sql

postgre:
	@pg_ctl -D ${POSTGRES_DATA_FOLDER} -l ${POSTGRES_DATA_FOLDER}/server.log start

kill_postgre:
	@pg_ctl -D ${POSTGRES_DATA_FOLDER} stop -s -m fast
