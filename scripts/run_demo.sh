#!/usr/bin/env bash

# SentinelSOC Complete End-to-End Environment Demonstrator
# Ensures python is configured, installs requests locally if bounded, and fires the sequence.

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo "======================================"
echo " SentinelSOC Interactive Demo Runner"
echo "======================================"

if ! command -v python3 &> /dev/null
then
    if ! command -v python &> /dev/null
    then
        echo "[!] Python is not installed. Required for runner."
        exit 1
    else
        PY=python
    fi
else
    PY=python3
fi

# Ensure dependencies 
# pip install requests > /dev/null 2>&1

FAST_ARG=""
if [ "$1" == "--fast" ]; then
    FAST_ARG="--fast"
fi

$PY "$DIR/run_demo.py" $FAST_ARG

# Optionally hook API validation
echo "--- Fetching Incident State ---"
curl -s http://localhost:4000/api/alerts | grep -q "HIGH"
if [ $? -eq 0 ]; then
   echo "[+] Verified: Backend recorded HIGH severity incident!"
else
   echo "[-] Notice: Incident not found via REST. Check dashboard websockets."
fi 
