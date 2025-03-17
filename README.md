# cs360-class-project

Run Steps:

- Clone and open repository locally
- Frontend
  - [Install yarn](https://classic.yarnpkg.com/lang/en/docs/install/#windows-stable)
  - Run _yarn install_
  - Navigate into the _/frontend_ directory in your terminal
  - Run _yarn run start_ for basic Expo deployment, otherwise look at yarn scripts in package.json
  - Open the port that is opened from the terminal
  - To add dependencies run "yarn add _dependency-name_"
- Backend
  - Navigate into the _/backend_ directory in your terminal
  - [Activate your virtual environment](https://fastapi.tiangolo.com/virtual-environments/#activate-the-virtual-environment)
  - Run _pip install -r requirements.txt_
  - Start the server with _fastapi dev main.py --host 0.0.0.0_
  - See API documentation at [localhost/docs](http://127.0.0.1:8000/docs)
  - To add dependencies type them out on a new line in _requirements.txt_
- Database
  - [Install MySQL](https://dev.mysql.com/doc/refman/8.4/en/installing.html)
  - [Load database from files in _database_](https://dev.mysql.com/doc/refman/5.7/en/reloading-delimited-text-dumps.html)
  - After editing, [dump the new database](https://dev.mysql.com/doc/refman/5.7/en/mysqldump-delimited-text.html) and replace the previous _database_ directory contents
