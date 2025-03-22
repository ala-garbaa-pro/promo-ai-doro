#!/bin/bash
source clone_docs.sh

# Call the function with parameters
clone_docs \
    "drizzle-team" \
    "drizzle-orm-docs" \
    "main" \
    "src/content/docs" \
    "local-docs/drizzle-orm"
