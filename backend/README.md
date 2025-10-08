# voxirad

STEPS TO BRING UP SERVER:
  -> Install python 3.12
          add-apt-repository ppa:deadsnakes/ppa
          apt install python3.12
  -> Install poetry
          curl -sSL https://install.python-poetry.org | python3 -
  -> Install dependencies
          poetry install
  -> Execute poetry run uvicorn backend.app.main:app --reload --host localhost --port 80
