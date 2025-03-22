#!/bin/bash
ENV_FILE=".dev.env"
_INNER_POSTGRES_IMAGE="postgres:17.2-alpine3.21"
DEFAULT_CONFIG_SQL_FILE="default_config.sql"
DEFAULT_USERS_SQL_FILE="default_users.sql"
DEFAULT_DATA_SQL_FILE="default_data.sql"
INIT_DB_FILE="init-db.sql"

#############################################
##########   FUNCTIONS       #############################################################
#############################################

# Function to read $ENV_FILE file and extract variables

load_env() {
    if [ -f $ENV_FILE ]; then
        # Extract DATABASE_URL from $ENV_FILE

        DATABASE_URL=$(grep -oP '^DATABASE_URL="\K[^"]+' $ENV_FILE)

        # Parse DATABASE_URL into components
        if [[ $DATABASE_URL =~ ^postgres://([^:]+):([^@]+)@([^:]+):([0-9]+)/(.+)$ ]]; then
            __S_DRIVER__="postgres"
            __S_USER__="${BASH_REMATCH[1]}"
            __S_PASSWORD__="${BASH_REMATCH[2]}"
            __S_HOST__="${BASH_REMATCH[3]}"
            __S_PORT__="${BASH_REMATCH[4]}"
            __S_DB_NAME__="${BASH_REMATCH[5]}"
            __S_DB_VOL__="vol_$__S_DB_NAME__"
            __S_CNTR_NAME__="${__S_DB_NAME__}_cntr"
        else
            echo "DATABASE_URL format is invalid"
        fi
    else
        echo "$ENV_FILE file not found"
    fi
}

# Define the function
clean_sql_file() {
    local input_file=$1
    local output_file=$2

    if [ -z "$output_file" ]; then
        # Use a temporary file for intermediate storage
        local tempfile=$(mktemp)
        sed '/^--/d; /^SET /d; /^SELECT /d; /^$/d' "$input_file" >"$tempfile"
        mv "$tempfile" "$input_file"
    else
        # Directly output to the specified file
        sed '/^--/d; /^SET /d; /^SELECT /d; /^$/d' "$input_file" >"$output_file"
    fi
}

generate_init_db_file() {
    echo "" >$INIT_DB_FILE

    if [ -f ./${DEFAULT_CONFIG_SQL_FILE} ]; then
        echo "-- START ADDING DEFAULT CONFIG" >>$INIT_DB_FILE
        cat ./${DEFAULT_CONFIG_SQL_FILE} >>$INIT_DB_FILE
        echo "-- END ADDING DEFAULT CONFIG" >>$INIT_DB_FILE
        echo -e "\n🟢 The default config added\n"
    else
        echo "🚨 ${DEFAULT_CONFIG_SQL_FILE} not found"
    fi

    rm -fr ./drizzle && pnpm -exec drizzle-kit generate

    # Wait for 2 seconds
    echo -e "\n🟢 Wait for 2 seconds\n"
    sleep 2

    # Find the first .sql file in ./drizzle folder and append its contents to ${INIT_DB_FILE}
    first_sql_file=$(find ./drizzle -type f -name "*.sql" | head -n 1)

    if [ -n "$first_sql_file" ]; then
        echo "-- START ADDING TABLES FROM ./drizzle" >>${INIT_DB_FILE}
        cat "$first_sql_file" >>${INIT_DB_FILE}
        echo "-- END ADDING TABLES FROM ./drizzle" >>${INIT_DB_FILE}
        echo -e "\n🟢 Drizzle tables added\n"
    else
        echo "🚨 No .sql file found in ./drizzle"
        exit 99
    fi

    # get clean _${DEFAULT_USERS_SQL_FILE}
    if [ -f ./${DEFAULT_USERS_SQL_FILE} ]; then
        clean_sql_file ${DEFAULT_USERS_SQL_FILE} _${DEFAULT_USERS_SQL_FILE}
        if [ -f _${DEFAULT_USERS_SQL_FILE} ]; then
            echo -e "\n🟢 The default cleaned users '_${DEFAULT_USERS_SQL_FILE}' created\n"
        else
            echo "🚨 There are no "_${DEFAULT_USERS_SQL_FILE}" file"
            exit 96
        fi
    else
        echo "🚨 There are no ${DEFAULT_USERS_SQL_FILE} file"
        exit 98
    fi

    # if the file ./${DEFAULT_DATA_SQL_FILE} exists add to ${INIT_DB_FILE}
    if [ -f ./${DEFAULT_DATA_SQL_FILE} ]; then
        # check if any lines from _${DEFAULT_USERS_SQL_FILE} exists in ${INIT_DB_FILE} the remove them
        grep -F -v -f _${DEFAULT_USERS_SQL_FILE} ${DEFAULT_DATA_SQL_FILE} >_${DEFAULT_DATA_SQL_FILE}
        echo -e "\n🟢 The default cleaned data '_${DEFAULT_DATA_SQL_FILE}' created\n"
    else
        echo "🚨 There are no ${DEFAULT_DATA_SQL_FILE} file"
        exit 95
    fi

    # if the file ./${DEFAULT_USERS_SQL_FILE} exists add to ${INIT_DB_FILE}
    if [ -f ./${DEFAULT_USERS_SQL_FILE} ]; then
        echo "-- START ADDING DEFAULT USERS" >>$INIT_DB_FILE
        cat ./_${DEFAULT_USERS_SQL_FILE} >>$INIT_DB_FILE
        echo "-- END ADDING DEFAULT USERS" >>$INIT_DB_FILE

        echo -e "\n🟢 The default users added\n"
    fi

    if [ -f ./_${DEFAULT_DATA_SQL_FILE} ]; then
        echo "-- START ADDING DEFAULT DATA" >>$INIT_DB_FILE
        cat ./_${DEFAULT_DATA_SQL_FILE} >>$INIT_DB_FILE
        echo "-- END ADDING DEFAULT DATA" >>$INIT_DB_FILE

        echo -e "\n🟢 The default data added\n"
    else
        echo "There are no _${DEFAULT_DATA_SQL_FILE} file"
        exit 97
    fi

    rm -f _${DEFAULT_USERS_SQL_FILE}
    if [ ! -f _${DEFAULT_USERS_SQL_FILE} ]; then
        echo -e "\n🟢 '_${DEFAULT_USERS_SQL_FILE}' deleted\n"
    fi

    rm -f _${DEFAULT_DATA_SQL_FILE}
    if [ ! -f _${DEFAULT_DATA_SQL_FILE} ]; then
        echo -e "\n🟢 '_${DEFAULT_DATA_SQL_FILE}' deleted\n"
    fi

    echo "${INIT_DB_FILE} created ✅"
}

# Function to generate docker-compose.yml
generate_docker_compose() {
    # echo "__S_DRIVER__=$__S_DRIVER__"
    # echo "__S_USER__=$__S_USER__"
    # echo "__S_PASSWORD__=$__S_PASSWORD__"
    # echo "__S_HOST__=$__S_HOST__"
    # echo "__S_PORT__=$__S_PORT__"
    # echo "__S_DB_NAME__=$__S_DB_NAME__"

    cat <<EOF >docker-compose.yml
# DON'T EDIT THIS FILE. This an auto generated docker-compose.yml file from db.sh    
services:

  $__S_CNTR_NAME__:
    container_name: $__S_CNTR_NAME__
    image: $_INNER_POSTGRES_IMAGE
    restart: unless-stopped
    ports:
      - "$__S_PORT__:$__S_PORT__"
    command: -p $__S_PORT__
    environment:
      POSTGRES_DB: $__S_DB_NAME__
      POSTGRES_USER: $__S_USER__
      POSTGRES_PASSWORD: $__S_PASSWORD__
    volumes:
      - $__S_DB_VOL__:/var/lib/postgresql/data
      - ./${INIT_DB_FILE}:/docker-entrypoint-initdb.d/${INIT_DB_FILE}

volumes:
  $__S_DB_VOL__:
    name: $__S_DB_VOL__

EOF
}

# Function to remove the named volume
remove_volume() {
    echo "Removing the database volume..."
    docker volume rm $__S_DB_VOL__
}

# Function to stop and remove the container
down_container() {
    echo "Stopping and removing the container..."

    docker stop $__S_CNTR_NAME__
    docker rm $__S_CNTR_NAME__
    
    # Check the operating system
    if [ "$(uname)" == "Linux" ]; then
        # Linux systems use "docker compose"
        docker compose down
    else
        # Windows and other systems use "docker-compose"
        docker-compose down
    fi

}

up_container() {
    echo "Starting the container..."
    
     # Check the operating system
    if [ "$(uname)" == "Linux" ]; then
        # Linux systems use "docker compose"
        docker compose up -d --build --force-recreate
    else
        # Windows and other systems use "docker-compose"
        docker-compose up -d --build --force-recreate
    fi
}

# Function to extract data from the database and generate a SQL file
extract_data() {
    echo "🧃 Extracting data from the database..."

    # Ensure Docker is available
    if ! command -v docker &>/dev/null; then
        echo " 🧧 Docker could not be found. Please install Docker."
        exit 1
    fi

    # Check if the container is running
    if ! docker ps --format '{{.Names}}' | grep -q "$__S_CNTR_NAME__"; then
        echo " �� Container $__S_CNTR_NAME__ is not running."
        exit 1
    fi

    # Remove any existing file
    rm -f extracted-data.sql

    # Construct the pg_dump command
    DUMP_CMD="docker exec $__S_CNTR_NAME__ pg_dump --dbname=$DATABASE_URL -a -F p --inserts -f extracted-data.sql"

    # Run the pg_dump command
    echo
    echo "Running command 🎽 : $DUMP_CMD"
    echo
    echo "🐛 to DEBUG use :"
    echo "docker exec -it $__S_CNTR_NAME__ sh"

    if ! eval $DUMP_CMD; then
        echo -e "\n⭕ Docker command failed! The device or resource might be busy. Please try again.\n"
        exit 1
    fi

    # Construct the docker cp command
    CP_CMD="echo && echo -n '🥬 Copying data to extracted-data.sql: ' && docker cp $__S_CNTR_NAME__:/extracted-data.sql extracted-data.sql"

    # Run the docker cp command
    echo
    echo "Running command 🎽 : $CP_CMD"

    eval $CP_CMD
    echo

    # Clean up the SQL file
    clean_sql_file "extracted-data.sql" "${DEFAULT_DATA_SQL_FILE}"

    # Remove any line in $DEFAULT_DATA_SQL_FILE that have INSERT INTO public.sessions
    sed -i '/INSERT INTO public.sessions/d' "${DEFAULT_DATA_SQL_FILE}"
  
    # Remove any line in $DEFAULT_DATA_SQL_FILE that have INSERT INTO public.sessions
    sed -i '/INSERT INTO public.users/d' "${DEFAULT_DATA_SQL_FILE}"

    if [ $? -eq 0 ]; then
        echo "🥬 Data extracted successfully to ${DEFAULT_DATA_SQL_FILE}"
        rm -f extracted-data.sql
        echo
        if [ -f extracted-data.sql ]; then
            echo "🧧 Failed to remove extracted-data.sql"
        else
            echo "🥬 Extracted data removed successfully"
        fi
    else
        echo "🧧 Failed to extract data"
    fi
}

# Function to extract data from a specific table in the database and generate a SQL file
extract_table() {
    local TABLE_NAME=$1

    if [ -z "$TABLE_NAME" ]; then
        echo "🧧 No table name provided. Usage: extract_table <table_name>"
        return 1
    fi

    echo "🧃 Extracting data from table '$TABLE_NAME' in the database..."

    # Ensure Docker is available
    if ! command -v docker &>/dev/null; then
        echo "🧧 Docker could not be found. Please install Docker."
        exit 1
    fi

    # Check if the container is running
    if ! docker ps --format '{{.Names}}' | grep -q "$__S_CNTR_NAME__"; then
        echo "❌ Container $__S_CNTR_NAME__ is not running."
        exit 1
    fi

    # Remove any existing file
    rm -f $TABLE_NAME.sql

    # Construct the pg_dump command
    DUMP_CMD="docker exec $__S_CNTR_NAME__ pg_dump --dbname=$DATABASE_URL -t $TABLE_NAME -a -F p --inserts -f $TABLE_NAME.sql"


    # Run the pg_dump command
    echo
    echo "Running command 🎽 : $DUMP_CMD"
    echo
    echo "🐛 To DEBUG, use: docker exec -it $__S_CNTR_NAME__ sh"

    eval $DUMP_CMD

    # Construct the docker cp command
    CP_CMD="echo && echo -n '🥬 Copying data to $TABLE_NAME.sql: ' && docker cp $__S_CNTR_NAME__:$TABLE_NAME.sql $TABLE_NAME.sql"

    # Run the docker cp command
    echo
    echo "Running command 🎽 : $CP_CMD"

    eval $CP_CMD
    echo

    # Clean up the SQL file
    clean_sql_file "$TABLE_NAME.sql" "$TABLE_NAME-$(date +%Y-%m-%d).sql"

    if [ $? -eq 0 ]; then
        echo "🥬 Data extracted successfully to $TABLE_NAME-$(date +%Y-%m-%d).sql"
        rm -f $TABLE_NAME.sql
        echo
        if [ -f $TABLE_NAME.sql ]; then
            echo "🧧 Failed to remove $TABLE_NAME.sql"
        else
            echo "🥬 Extracted data removed successfully"
        fi
    else
        echo "🧧 Failed to extract data"
    fi
}

# Function to import a SQL file into the database
import_sql() {
    local SQL_FILE=$1

    if [ -z "$SQL_FILE" ]; then
        echo "🧧 No SQL file provided. Usage: import_sql <sql_file>"
        return 1
    fi

    echo "🧃 Importing data from file '$SQL_FILE' into the database..."

    # Ensure Docker is available
    if ! command -v docker &>/dev/null; then
        echo "🧧 Docker could not be found. Please install Docker."
        exit 1
    fi

    # Check if the container is running
    if ! docker ps --format '{{.Names}}' | grep -q "$__S_CNTR_NAME__"; then
        echo "❌ Container $__S_CNTR_NAME__ is not running."
        exit 1
    fi
    echo

    # Copy the SQL file to the container
    echo "🥬 Copying $SQL_FILE to the container..."

    # before coping get the folders have to create
    docker exec $__S_CNTR_NAME__ mkdir -p $(dirname $SQL_FILE)

    docker cp $SQL_FILE $__S_CNTR_NAME__:$SQL_FILE
    echo

    # Import the SQL file
    echo "Running command 🎽 : docker exec -i $__S_CNTR_NAME__ psql -U $__S_USER__ -d $__S_DB_NAME__ -f $SQL_FILE"
    docker exec -i $__S_CNTR_NAME__ psql -U $__S_USER__ -d $__S_DB_NAME__ -f $SQL_FILE

    # Clean up the SQL file from the container
    echo "🥬 Removing $SQL_FILE from the container..."
    docker exec $__S_CNTR_NAME__ rm -fr $SQL_FILE

    echo "🥬 Data imported successfully from $SQL_FILE"
}

function showOptions() {
    echo "Options:"
    echo "  -i, --initialize-db    Initialize the database and set up Docker containers"
    echo "  -e, --extract-data     Load environment and extract data"
    echo "  -d, --down             Stop Docker containers"
    echo "  -u, --up               Start Docker containers"
    echo "  -et, --extract-table   Extract data from a specific table"
    echo "  -is, --import-sql      Import data from a SQL file"

}

#############################################
##########   Main script       ###########################################################
#############################################
# Main script
if [[ $# -eq 0 ]]; then
    echo "Usage: $0"
    showOptions
    exit 1
fi

# Parse command-line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
    -i | --initialize-db)
        load_env
        down_container
        remove_volume
        generate_init_db_file
        generate_docker_compose
        up_container
        shift
        ;;
    -d | --down)
        down_container
        shift
        ;;
    -u | --up)
        up_container
        shift
        ;;
    -e | --extract-data)
        load_env
        extract_data
        shift
        ;;
    -et | --extract-table)
        load_env
        if [[ -z "$2" ]]; then
            echo "🧧 Table name not provided for extraction. Usage: $0 -et <table_name>"
            exit 1
        fi
        extract_table "$2"
        shift 2
        ;;
    -is | --import-sql)
        load_env
        if [[ -z "$2" ]]; then
            echo "🧧 SQL file not provided for import. Usage: $0 -i <sql_file>"
            exit 1
        fi
        import_sql "$2"
        shift 2
        ;;
    *)
        showOptions
        echo "Invalid argument: $1"
        echo "Usage: $0 [options]"
        exit 1
        ;;
    esac
done
