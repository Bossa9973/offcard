#!/bin/sh
# Restore home-polish files to their state before the Sept 23 pass.
cd "$(dirname "$0")/../.." && cp -R output/pre-home-polish/src/. src/ && echo restored
