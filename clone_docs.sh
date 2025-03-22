function clone_docs() {
    local REPO_ORG=$1
    local REPO_NAME=$2
    local BRANCH=$3
    local DOCS_REMOTE_RELATIVE_PATH=$4
    local LOCAL_TARGET_DIR=$5

    echo
    echo "REPO_ORG='$REPO_ORG'"
    echo "REPO_NAME='$REPO_NAME'"
    echo "BRANCH='$BRANCH'"
    echo "DOCS_REMOTE_RELATIVE_PATH='$DOCS_REMOTE_RELATIVE_PATH'"
    echo "LOCAL_TARGET_DIR='$LOCAL_TARGET_DIR'"
    echo

    echo "Remove directory :'$LOCAL_TARGET_DIR'"
    rm -fr "$LOCAL_TARGET_DIR"

    echo "Make directory :'$LOCAL_TARGET_DIR'"
    mkdir -p "$LOCAL_TARGET_DIR"

    echo "Change directory :'$LOCAL_TARGET_DIR'"
    cd "$LOCAL_TARGET_DIR" || exit

    echo "Clone the repository with sparse-checkout enabled :'git clone --depth 1 --filter=blob:none --sparse --branch $BRANCH https://github.com/$REPO_ORG/$REPO_NAME.git'"
    echo
    git clone --depth 1 --filter=blob:none --sparse --branch "$BRANCH" "https://github.com/$REPO_ORG/$REPO_NAME.git"
    echo

    echo "Enter the $REPO_NAME in the cloned directory :'$(pwd)'"
    cd "$REPO_NAME" || exit

    echo "Configure sparse checkout to include only the docs folder :'git sparse-checkout set $DOCS_REMOTE_RELATIVE_PATH'"
    git sparse-checkout set "$DOCS_REMOTE_RELATIVE_PATH"

    echo "Move the docs folder contents to your current directory and remove the rest :'mv $DOCS_REMOTE_RELATIVE_PATH/* ..'"
    mv "$DOCS_REMOTE_RELATIVE_PATH"/* ..

    echo "Go up one level :'cd ..'"
    cd .. || exit

    echo "Remove the rest :'rm -rf $REPO_NAME'"
    rm -rf "$REPO_NAME"

    echo
    echo "Enjoy!"
    echo
}
