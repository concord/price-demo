#!/bin/bash
set -x

SOURCE="${BASH_SOURCE[0]}"
while [ -h "$SOURCE" ]; do # resolve $SOURCE until the file is no longer a symlink
    DIR="$( cd -P "$( dirname "$SOURCE" )" && pwd )"
    SOURCE="$(readlink "$SOURCE")"
    [[ $SOURCE != /* ]] && SOURCE="$DIR/$SOURCE"
    # if $SOURCE was a relative symlink, we need to resolve it
    # relative to the path where the symlink file was located
done
DIR="$( cd -P "$( dirname "$SOURCE" )" && pwd )"
original=${PWD}
requirements=$(find $DIR -name requirements.txt)

echo "Mesos directory: ${PWD}"
echo "Exec directory: ${DIR}"

if [[ -f $requirements ]]; then
    # need to overcome pip 128 chars path - software... :'(
    dir=$(mktemp -d)
    cd $dir
    echo "Installing venv in $dir"
    virtualenv $dir/env
    $dir/env/bin/pip install -r $requirements
    exec $dir/env/bin/python "$original/$@"
else
    exec python "$original/$@"
fi

rc = $?
if [[ $rc != 0 ]]; then
    echo "Client exited with: $rc"
    exit $rc
fi
