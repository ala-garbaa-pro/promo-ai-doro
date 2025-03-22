#!/bin/bash
source clone_docs.sh

# Call the function with parameters
clone_docs \
    "tailwindlabs" \
    "tailwindcss.com" \
    "main" \
    "src/docs" \
    "local-docs/tailwindcss-docs"
