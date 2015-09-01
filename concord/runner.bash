#!/bin/bash
set -x
original=${PWD}
echo "Directory: ${PWD}"
if [[ -f $original/requirements.txt ]]; then
    # need to overcome pip 128 chars path - software... :'(
    dir=$(mktemp -d)
    cd $dir
    echo "Installing venv in $dir"
    virtualenv $dir/env
    $dir/env/bin/pip install -r $original/requirements.txt
    exec $dir/env/bin/python "$original/$@"
else
    exec python "$original/$@"
fi

rc = $?
if [[ $rc != 0 ]]; then
    echo "Client exited with: $rc"
    exit $rc
fi
