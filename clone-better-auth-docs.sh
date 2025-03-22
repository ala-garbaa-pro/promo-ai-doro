#!/bin/bash
source clone_docs.sh

# Call the function with parameters
clone_docs \
    "better-auth" \
    "better-auth" \
    "main" \
    "docs/content/docs" \
    "local-docs/better-auth"
