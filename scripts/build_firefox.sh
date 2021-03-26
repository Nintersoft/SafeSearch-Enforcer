#!/bin/bash
set +x
rm -rf ../output
mkdir ../output
web-ext -s ../Firefox/ -a ../output/ -v build